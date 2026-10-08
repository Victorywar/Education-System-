const express = require('express');
const { registerStudent, loginStudent } = require('../controllers/authController');
const {
  getDashboard,
  getProfile,
  getAssessmentQuestions,
  getAssessment,
  submitAssessment,
  getRecommendations,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Phase 2 — Authentication
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Phase 3 — Dashboard & Profile
router.get('/dashboard', protect, requireRole('student'), getDashboard);
router.get('/profile', protect, requireRole('student'), getProfile);

// Phase 4 — Interest Assessment
router.get('/assessment/questions', protect, requireRole('student'), getAssessmentQuestions);
router.get('/assessment', protect, requireRole('student'), getAssessment);
router.post('/assessment', protect, requireRole('student'), submitAssessment);

// Phase 5 — Smart Skill Recommendations
router.get('/recommendations', protect, requireRole('student'), getRecommendations);

module.exports = router;
