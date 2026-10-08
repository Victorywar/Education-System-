const Student = require('../models/Student');
const Course = require('../models/Course');
const { recommendCourses } = require('../services/recommendationEngine');

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: 'What activity do you enjoy most?',
    options: ['Working with numbers', 'Using computers', 'Speaking with others', 'Solving puzzles'],
  },
  {
    id: 2,
    question: 'What would you like to learn?',
    options: ['Abacus', 'Coding', 'Communication Skills', 'Logical Reasoning'],
  },
  {
    id: 3,
    question: 'Which subject do you enjoy?',
    options: ['Mathematics', 'Computer Science', 'English', 'General Knowledge'],
  },
  {
    id: 4,
    question: 'Which activity feels easiest?',
    options: ['Calculations', 'Computer activities', 'Speaking', 'Problem solving'],
  },
  {
    id: 5,
    question: 'What would you like to improve?',
    options: ['Numerical ability', 'Computer skills', 'Communication', 'Logical thinking'],
  },
];

const getQuestions = (req, res) => {
  res.json(ASSESSMENT_QUESTIONS);
};

const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: 'Please answer all 5 questions.' });
    }

    if (answers.some((a) => !a || String(a).trim() === '')) {
      return res.status(400).json({ message: 'All questions are mandatory.' });
    }

    const courses = await Course.find();
    const recommendations = recommendCourses(answers, courses);

    const student = await Student.findById(req.user._id);
    student.assessmentAnswers = answers;
    student.assessmentCompleted = true;
    student.recommendations = recommendations;
    student.recommendedSkill = recommendations[0]?.course || '';
    await student.save();

    res.json({
      message: 'Assessment completed successfully.',
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, submitAssessment, ASSESSMENT_QUESTIONS };
