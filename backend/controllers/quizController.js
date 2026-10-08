const Course = require('../models/Course');
const QuizResult = require('../models/QuizResult');
const Student = require('../models/Student');

const SKILL_ID_TO_SLUG = {
  abacus: 'abacus',
  coding: 'coding',
  communication: 'communication-skills',
  'communication-skills': 'communication-skills',
  'logical-reasoning': 'logical-reasoning',
};

const getPerformanceLabel = (percentage) => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Needs Improvement';
  return 'Needs Practice';
};

const findCourseBySkillOrId = async (param) => {
  if (!param) return null;
  const slug = SKILL_ID_TO_SLUG[param] || param;
  let course = await Course.findOne({ slug });
  if (course) return course;
  course = await Course.findOne({ name: new RegExp(`^${param}$`, 'i') });
  if (course) return course;
  if (/^[a-f\d]{24}$/i.test(param)) {
    return Course.findById(param);
  }
  return null;
};

const toQuizPayload = (course, skillId = null) => ({
  courseId: course._id,
  skillId: skillId || course.slug,
  courseName: course.name,
  questions: course.quiz.map((q, index) => ({
    index,
    question: q.question,
    options: q.options,
  })),
  total: course.quiz.length,
});

/**
 * GET /api/quiz/skill/:skillId
 * Resolves Course by skill slug (abacus, coding, ...)
 */
const getQuizBySkill = async (req, res) => {
  try {
    const course = await findCourseBySkillOrId(req.params.skillId);
    if (!course || !course.quiz?.length) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found for this skill.',
      });
    }
    return res.json({
      success: true,
      ...toQuizPayload(course, req.params.skillId),
    });
  } catch (error) {
    console.error('Get quiz by skill error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load quiz. Please try again.',
    });
  }
};

/**
 * POST /api/quiz/skill/:skillId/submit
 */
const submitQuizBySkill = async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await findCourseBySkillOrId(req.params.skillId);
    if (!course || !course.quiz?.length) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found for this skill.',
      });
    }

    if (!answers || !Array.isArray(answers) || answers.length !== course.quiz.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all quiz questions.',
      });
    }

    let score = 0;
    course.quiz.forEach((q, i) => {
      if (Number(answers[i]) === q.correctAnswer) score += 1;
    });

    const total = course.quiz.length;
    const percentage = Math.round((score / total) * 100);
    const performance = getPerformanceLabel(percentage);

    const result = await QuizResult.create({
      student: req.user._id,
      course: course._id,
      score,
      total,
      percentage,
      performance,
      answers,
    });
    await Student.updateOne(
      { _id: req.user._id },
      { $set: { lastActiveAt: new Date() } }
    );

    return res.status(201).json({
      success: true,
      resultId: result._id,
      score,
      total,
      percentage,
      performance,
      courseName: course.name,
      skillId: req.params.skillId,
    });
  } catch (error) {
    console.error('Submit quiz by skill error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit quiz. Please try again.',
    });
  }
};

const getQuiz = async (req, res) => {
  try {
    const course = await findCourseBySkillOrId(req.params.courseId);
    if (!course || !course.quiz?.length) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    return res.json({
      success: true,
      ...toQuizPayload(course),
    });
  } catch (error) {
    console.error('Get quiz error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load quiz. Please try again.',
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await findCourseBySkillOrId(req.params.courseId);
    if (!course || !course.quiz?.length) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    if (!answers || !Array.isArray(answers) || answers.length !== course.quiz.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all quiz questions.',
      });
    }

    let score = 0;
    course.quiz.forEach((q, i) => {
      if (Number(answers[i]) === q.correctAnswer) score += 1;
    });

    const total = course.quiz.length;
    const percentage = Math.round((score / total) * 100);
    const performance = getPerformanceLabel(percentage);

    const result = await QuizResult.create({
      student: req.user._id,
      course: course._id,
      score,
      total,
      percentage,
      performance,
      answers,
    });
    await Student.updateOne(
      { _id: req.user._id },
      { $set: { lastActiveAt: new Date() } }
    );

    return res.status(201).json({
      success: true,
      resultId: result._id,
      score,
      total,
      percentage,
      performance,
      courseName: course.name,
    });
  } catch (error) {
    console.error('Submit quiz error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit quiz. Please try again.',
    });
  }
};

const getQuizResult = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.resultId).populate('course', 'name slug');
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found.',
      });
    }
    if (String(result.student) !== String(req.user._id) && req.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }
    return res.json({
      success: true,
      ...result.toObject(),
      id: result._id,
    });
  } catch (error) {
    console.error('Get quiz result error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load quiz result. Please try again.',
    });
  }
};

/**
 * Latest quiz result for a student (used by progress / volunteer views)
 */
const getLatestQuizForStudent = async (studentId) => {
  const result = await QuizResult.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate('course', 'name slug');
  if (!result) return null;
  return {
    resultId: result._id,
    score: result.score,
    total: result.total,
    percentage: result.percentage,
    performance: result.performance,
    courseName: result.course?.name || null,
    skillId: result.course?.slug || null,
    createdAt: result.createdAt,
  };
};

const getQuizResultsByStudent = async (studentId) => {
  const results = await QuizResult.find({ student: studentId })
    .sort({ createdAt: -1 })
    .populate('course', 'name slug');

  // Keep latest per course
  const byCourse = new Map();
  results.forEach((r) => {
    const key = String(r.course?._id || r.course);
    if (!byCourse.has(key)) {
      byCourse.set(key, {
        resultId: r._id,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        performance: r.performance,
        courseName: r.course?.name || null,
        skillId: r.course?.slug || null,
        createdAt: r.createdAt,
      });
    }
  });
  return Array.from(byCourse.values());
};

module.exports = {
  getQuiz,
  submitQuiz,
  getQuizBySkill,
  submitQuizBySkill,
  getQuizResult,
  getLatestQuizForStudent,
  getQuizResultsByStudent,
  getPerformanceLabel,
};
