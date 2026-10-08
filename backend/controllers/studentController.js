const Student = require('../models/Student');
const ClassSession = require('../models/Class');
const { generateRecommendations } = require('../services/recommendationService');
const { getProgressSummaryForStudent } = require('./progressController');

/**
 * Phase 3 — Student dashboard overview
 * GET /api/students/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Unable to load your profile. Please try again.',
      });
    }

    // Phase 7 — real weekend class registration check
    let hasClassRegistration = false;
    try {
      const registered = await ClassSession.findOne({
        registeredStudents: student._id,
      }).select('_id');
      hasClassRegistration = !!registered;
    } catch {
      hasClassRegistration = false;
    }

    const lastActiveAt = student.lastActiveAt || student.createdAt || new Date();
    const daysInactive = Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
    const assessmentCompleted = !!student.assessmentCompleted;
    const progressSummary = await getProgressSummaryForStudent(student._id);

    return res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        age: student.age,
        className: student.className,
        school: student.school,
        location: student.location,
        language: student.language,
        assessmentCompleted,
      },
      assessmentStatus: assessmentCompleted ? 'Completed' : 'Not Completed',
      recommendationStatus: assessmentCompleted ? 'Available' : 'Complete assessment first',
      classStatus: hasClassRegistration ? 'Registered' : 'Not Registered',
      daysInactive,
      inactivityWarning: daysInactive >= 15,
      progressStatus: progressSummary.progressStatus,
      learningProgress: progressSummary,
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your profile. Please try again.',
    });
  }
};

/**
 * Phase 3 — Student profile
 * GET /api/students/profile
 * Uses JWT userId only — never accept profile :id from URL
 */
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Unable to load your profile. Please try again.',
      });
    }

    return res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        age: student.age,
        className: student.className,
        school: student.school,
        location: student.location,
        language: student.language,
        guardianContact: student.guardianContact,
        username: student.username,
        assessmentCompleted: student.assessmentCompleted,
        role: student.role,
      },
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your profile. Please try again.',
    });
  }
};

/**
 * Phase 4 — Valid assessment questions and allowed answers
 * Categories are stored for Phase 5 — NOT ranked in this phase.
 */
const ASSESSMENT_QUESTIONS = [
  {
    questionId: 1,
    question: 'What activity do you enjoy most?',
    options: [
      { answer: 'Working with numbers', category: 'Abacus' },
      { answer: 'Using computers', category: 'Coding' },
      { answer: 'Speaking with others', category: 'Communication Skills' },
      { answer: 'Solving puzzles', category: 'Logical Reasoning' },
    ],
  },
  {
    questionId: 2,
    question: 'What would you like to learn?',
    options: [
      { answer: 'Abacus', category: 'Abacus' },
      { answer: 'Coding', category: 'Coding' },
      { answer: 'Communication Skills', category: 'Communication Skills' },
      { answer: 'Logical Reasoning', category: 'Logical Reasoning' },
    ],
  },
  {
    questionId: 3,
    question: 'Which subject do you enjoy most?',
    options: [
      { answer: 'Mathematics', category: 'Abacus' },
      { answer: 'Computer Science', category: 'Coding' },
      { answer: 'English', category: 'Communication Skills' },
      { answer: 'General Knowledge', category: 'Logical Reasoning' },
    ],
  },
  {
    questionId: 4,
    question: 'Which activity feels easiest to you?',
    options: [
      { answer: 'Calculations', category: 'Abacus' },
      { answer: 'Computer activities', category: 'Coding' },
      { answer: 'Speaking', category: 'Communication Skills' },
      { answer: 'Problem solving', category: 'Logical Reasoning' },
    ],
  },
  {
    questionId: 5,
    question: 'What would you like to improve?',
    options: [
      { answer: 'Numerical ability', category: 'Abacus' },
      { answer: 'Computer skills', category: 'Coding' },
      { answer: 'Communication', category: 'Communication Skills' },
      { answer: 'Logical thinking', category: 'Logical Reasoning' },
    ],
  },
];

const getAssessmentQuestions = (req, res) => {
  res.json({
    success: true,
    questions: ASSESSMENT_QUESTIONS.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options.map((o) => o.answer),
    })),
  });
};

/** Load saved assessment for retake (no recommendation) */
const getAssessment = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select(
      'assessment assessmentCompleted'
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Unable to load your assessment. Please try again.',
      });
    }

    return res.json({
      success: true,
      assessmentCompleted: !!student.assessmentCompleted,
      assessment: student.assessment || null,
    });
  } catch (error) {
    console.error('Get assessment error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your assessment. Please try again.',
    });
  }
};

/**
 * Phase 4 — Submit / retake interest assessment
 * POST /api/students/assessment
 * Does NOT calculate recommendations (Phase 5).
 */
const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment data.',
      });
    }

    const normalized = [];
    const seenIds = new Set();

    for (const item of answers) {
      const questionId = Number(item.questionId);
      const answer = typeof item.answer === 'string' ? item.answer.trim() : '';
      const category = typeof item.category === 'string' ? item.category.trim() : '';

      if (!questionId || !answer || !category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment data.',
        });
      }

      if (seenIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment data.',
        });
      }
      seenIds.add(questionId);

      const questionDef = ASSESSMENT_QUESTIONS.find((q) => q.questionId === questionId);
      if (!questionDef) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment data.',
        });
      }

      const optionDef = questionDef.options.find((o) => o.answer === answer);
      if (!optionDef || optionDef.category !== category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment data.',
        });
      }

      normalized.push({
        questionId,
        answer,
        category: optionDef.category,
      });
    }

    // Ensure question IDs 1–5 are all present
    for (let id = 1; id <= 5; id += 1) {
      if (!seenIds.has(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assessment data.',
        });
      }
    }

    normalized.sort((a, b) => a.questionId - b.questionId);

    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Unable to submit your assessment. Please try again.',
      });
    }

    student.assessment = {
      answers: normalized,
      completedAt: new Date(),
    };
    student.assessmentCompleted = true;
    student.lastActiveAt = new Date();
    // Keep plain answer list for later Phase 5 engine compatibility
    student.assessmentAnswers = normalized.map((a) => a.answer);

    await student.save();

    return res.json({
      success: true,
      message: 'Assessment completed successfully!',
      assessmentCompleted: true,
    });
  } catch (error) {
    console.error('Submit assessment error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit your assessment. Please try again.',
    });
  }
};

/** Reserved for later phases — kept so existing imports do not break */
const getProgress = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Progress module will be available in a later phase.',
  });
};

const updateLearningProgress = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Learning progress will be available in a later phase.',
  });
};

/**
 * Phase 5 — Smart skill recommendations (calculated from assessment)
 * GET /api/students/recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select(
      'assessment assessmentCompleted assessmentAnswers'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Unable to load recommendations. Please try again.',
      });
    }

    if (!student.assessmentCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the interest assessment first.',
      });
    }

    const answers = student.assessment?.answers;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the interest assessment first.',
      });
    }

    const result = generateRecommendations(answers);

    return res.json({
      success: true,
      topRecommendation: result.topRecommendation,
      recommendations: result.recommendations.map(({ skill, score, percentage, level, explanation }) => ({
        skill,
        score,
        percentage,
        level,
        explanation,
      })),
    });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load recommendations. Please try again.',
    });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  getAssessmentQuestions,
  getAssessment,
  submitAssessment,
  getRecommendations,
  getProgress,
  updateLearningProgress,
  ASSESSMENT_QUESTIONS,
};
