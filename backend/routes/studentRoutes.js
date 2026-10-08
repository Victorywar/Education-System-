const express = require('express');
const { getDashboard, getProfile, getProgress, updateLearningProgress } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('student'));
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.get('/progress', getProgress);
router.put('/learning-progress', updateLearningProgress);

module.exports = router;
