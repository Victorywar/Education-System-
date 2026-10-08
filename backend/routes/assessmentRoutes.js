const express = require('express');
const { getQuestions, submitAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/questions', protect, requireRole('student'), getQuestions);
router.post('/submit', protect, requireRole('student'), submitAssessment);

module.exports = router;
