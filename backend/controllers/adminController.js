const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const AdminAudit = require('../models/AdminAudit');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const ClassSession = require('../models/Class');
const Material = require('../models/Material');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { generateRecommendations } = require('../services/recommendationService');

const INACTIVE_DAYS = 30;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin username or password.' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment.');
      return res.status(500).json({ success: false, message: 'Unable to sign in. Please try again.' });
    }

    return res.json({
      success: true,
      token: jwt.sign({ userId: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' }),
      role: 'admin',
      user: { id: admin._id, name: admin.name, username: admin.username, role: 'admin' },
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to sign in. Please try again.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - INACTIVE_DAYS * DAY_IN_MS);
    const inactiveStudentFilter = {
      $or: [
        { lastActiveAt: { $type: 'date', $lte: cutoff } },
        {
          $and: [
            { $or: [{ lastActiveAt: { $exists: false } }, { lastActiveAt: null }] },
            { createdAt: { $lte: cutoff } },
          ],
        },
      ],
    };
    const [students, volunteers, pendingVolunteers, approvedVolunteers, classes, materials, inactiveStudentsCount] =
      await Promise.all([
        Student.countDocuments(),
        Volunteer.countDocuments(),
        Volunteer.countDocuments({ status: 'pending' }),
        Volunteer.countDocuments({ status: 'approved' }),
        ClassSession.countDocuments(),
        Material.countDocuments(),
        Student.countDocuments(inactiveStudentFilter),
      ]);

    return res.json({
      success: true,
      stats: {
        students,
        volunteers,
        pendingVolunteers,
        approvedVolunteers,
        classes,
        materials,
        inactiveStudentsCount,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load admin statistics.' });
  }
};

const getInactiveStudents = async (req, res) => {
  try {
    const now = Date.now();
    const cutoff = new Date(now - INACTIVE_DAYS * DAY_IN_MS);
    const students = await Student.find({
      $or: [
        { lastActiveAt: { $type: 'date', $lte: cutoff } },
        {
          $and: [
            { $or: [{ lastActiveAt: { $exists: false } }, { lastActiveAt: null }] },
            { createdAt: { $lte: cutoff } },
          ],
        },
      ],
    })
      .select('name age className school location language guardianContact username lastActiveAt createdAt assessmentCompleted')
      .sort({ lastActiveAt: 1, createdAt: 1 })
      .lean();

    const studentIds = students.map((student) => student._id);
    const classes = studentIds.length
      ? await ClassSession.find({ registeredStudents: { $in: studentIds } })
          .select('title registeredStudents')
          .lean()
      : [];
    const classByStudent = new Map();
    for (const classSession of classes) {
      for (const studentId of classSession.registeredStudents) {
        if (!classByStudent.has(String(studentId))) {
          classByStudent.set(String(studentId), classSession.title);
        }
      }
    }

    return res.json({
      success: true,
      students: students.map((student) => {
        const lastActiveAt = student.lastActiveAt || student.createdAt;
        return {
          id: student._id,
          name: student.name,
          age: student.age,
          className: student.className,
          username: student.username,
          school: student.school,
          location: student.location,
          language: student.language,
          guardianContact: student.guardianContact,
          lastActiveAt,
          daysInactive: Math.floor((now - new Date(lastActiveAt).getTime()) / DAY_IN_MS),
          assessmentStatus: student.assessmentCompleted ? 'Completed' : 'Not Completed',
          registeredClass: classByStudent.get(String(student._id)) || null,
        };
      }),
    });
  } catch (error) {
    console.error('Inactive student list error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load inactive students.' });
  }
};

const deleteStudentAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID.' });
  }

  let audit;
  try {
    const student = await Student.findById(req.params.id).select('-password').lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    audit = await AdminAudit.create({
      action: 'delete_student',
      performedBy: req.user._id,
      resourceId: student._id,
      resourceSnapshot: student,
      outcome: 'pending',
    });

    await Promise.all([
      Progress.deleteMany({ studentId: student._id }),
      QuizResult.deleteMany({ student: student._id }),
      Enrollment.deleteMany({ student: student._id }),
      ClassSession.updateMany(
        { registeredStudents: student._id },
        { $pull: { registeredStudents: student._id } }
      ),
    ]);
    const deletion = await Student.deleteOne({ _id: student._id });
    if (deletion.deletedCount !== 1) {
      throw new Error('Student deletion could not be verified.');
    }
    audit.outcome = 'completed';
    await audit.save();

    return res.json({
      success: true,
      message: 'Student and related learning records removed; audit recorded.',
      auditId: audit._id,
    });
  } catch (error) {
    if (audit) {
      audit.outcome = 'failed';
      try {
        await audit.save();
      } catch (auditError) {
        console.error('Student deletion audit update error:', auditError.message);
      }
    }
    console.error('Admin student deletion error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to delete student. Please try again.' });
  }
};

const getPendingVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: 1 });
    return res.json({ success: true, volunteers });
  } catch (error) {
    console.error('Pending volunteers error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load pending volunteers.' });
  }
};

const updateVolunteerStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }
    if (status === 'rejected' && !rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid volunteer ID.' });
    }

    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    volunteer.status = status;
    volunteer.approvedAt = status === 'approved' ? new Date() : undefined;
    volunteer.rejectionReason = status === 'rejected' ? rejectionReason.trim() : '';
    await volunteer.save();

    return res.json({
      success: true,
      message: `Volunteer ${status}.`,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        status: volunteer.status,
        approvedAt: volunteer.approvedAt,
        rejectionReason: volunteer.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Volunteer status update error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update volunteer status.' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select('name username className school location assessmentCompleted assessment recommendedSkill')
      .sort({ createdAt: -1 })
      .lean();
    const studentIds = students.map((student) => student._id);
    const [quizResults, registeredClasses] = await Promise.all([
      QuizResult.find({ student: { $in: studentIds } })
        .sort({ createdAt: -1 })
        .populate('course', 'name slug')
        .lean(),
      ClassSession.find({ registeredStudents: { $in: studentIds } })
        .select('title skill date day registeredStudents')
        .lean(),
    ]);

    const latestQuizByStudent = new Map();
    for (const result of quizResults) {
      const key = String(result.student);
      if (!latestQuizByStudent.has(key)) latestQuizByStudent.set(key, result);
    }
    const classByStudent = new Map();
    for (const classSession of registeredClasses) {
      for (const studentId of classSession.registeredStudents) {
        if (!classByStudent.has(String(studentId))) classByStudent.set(String(studentId), classSession);
      }
    }

    return res.json({
      success: true,
      students: students.map((student) => {
        const { assessment, ...studentRecord } = student;
        const quiz = latestQuizByStudent.get(String(student._id));
        const registeredClass = classByStudent.get(String(student._id));
        let recommendedSkill = student.recommendedSkill || 'Not available';
        if (!student.recommendedSkill && student.assessmentCompleted && assessment?.answers?.length) {
          try {
            recommendedSkill =
              generateRecommendations(assessment.answers).topRecommendation?.skill || 'Not available';
          } catch (error) {
            console.error(`Unable to calculate recommended skill for student ${student._id}:`, error.message);
          }
        }
        return {
          ...studentRecord,
          assessmentStatus: student.assessmentCompleted ? 'Completed' : 'Not Completed',
          recommendedSkill,
          quizStatus: quiz ? 'Completed' : 'Not Completed',
          latestQuiz: quiz
            ? {
                percentage: quiz.percentage,
                score: quiz.score,
                total: quiz.total,
                courseName: quiz.course?.name || 'Quiz',
                completedAt: quiz.createdAt,
              }
            : null,
          classRegistrationStatus: registeredClass ? 'Registered' : 'Not Registered',
          registeredClass: registeredClass
            ? {
                title: registeredClass.title,
                skill: registeredClass.skill,
                date: registeredClass.date,
                day: registeredClass.day,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error('Admin student roster error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load student roster.' });
  }
};

const getAdminClasses = async (req, res) => {
  try {
    const classes = await ClassSession.find().sort({ date: 1 }).lean();
    return res.json({ success: true, classes });
  } catch (error) {
    console.error('Admin classes error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load classes.' });
  }
};

const deleteClassAdmin = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid class ID.' });
  }

  let audit;
  try {
    const classSession = await ClassSession.findById(req.params.id).lean();
    if (!classSession) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    audit = await AdminAudit.create({
      action: 'delete_class',
      performedBy: req.user._id,
      resourceId: classSession._id,
      resourceSnapshot: classSession,
      outcome: 'pending',
    });

    const deletion = await ClassSession.deleteOne({ _id: classSession._id });
    if (deletion.deletedCount !== 1) {
      throw new Error('Class was not removed; the deletion could not be verified.');
    }
    audit.outcome = 'completed';
    await audit.save();
    return res.json({
      success: true,
      message: 'Class deleted and audit recorded.',
      auditId: audit._id,
    });
  } catch (error) {
    if (audit) {
      audit.outcome = 'failed';
      try {
        await audit.save();
      } catch (auditError) {
        console.error('Admin class deletion audit update error:', auditError.message);
      }
    }
    console.error('Admin class deletion error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to delete class. Please try again.' });
  }
};

module.exports = {
  adminLogin,
  getAdminStats,
  getPendingVolunteers,
  updateVolunteerStatus,
  getAllStudents,
  getInactiveStudents,
  deleteStudentAdmin,
  getAdminClasses,
  deleteClassAdmin,
};
