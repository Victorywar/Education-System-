const express = require('express');
const {
  volunteerRegister,
  volunteerLogin,
  getDashboardStats,
  getStudents,
  getStudentDetails,
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Volunteer registration and login are public.
router.post('/register', volunteerRegister);
router.post('/login', volunteerLogin);

// Protected volunteer routes
router.get('/dashboard', protect, requireRole('volunteer'), getDashboardStats);
router.get('/students', protect, requireRole('volunteer'), getStudents);
router.get('/students/:id', protect, requireRole('volunteer'), getStudentDetails);

module.exports = router;
