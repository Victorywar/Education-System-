const express = require('express');
const {
  getQuiz,
  submitQuiz,
  getQuizBySkill,
  submitQuizBySkill,
  getQuizResult,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/result/:resultId', protect, getQuizResult);
router.get('/skill/:skillId', protect, requireRole('student'), getQuizBySkill);
router.post('/skill/:skillId/submit', protect, requireRole('student'), submitQuizBySkill);
router.get('/:courseId', protect, requireRole('student'), getQuiz);
router.post('/:courseId/submit', protect, requireRole('student'), submitQuiz);

module.exports = router;
