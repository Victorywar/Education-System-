const express = require('express');
const {
  getClasses,
  getClassById,
  registerForClass,
  getMyRegistrations,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Shared read access (student weekend view / volunteer management view)
router.get('/', protect, requireRole('student', 'volunteer'), getClasses);
router.get('/my-registrations', protect, requireRole('student'), getMyRegistrations);

// Volunteer class management
router.post('/', protect, requireRole('volunteer'), createClass);
router.put('/:classId', protect, requireRole('volunteer'), updateClass);
router.delete('/:classId', protect, requireRole('volunteer'), deleteClass);

// Student registration + details (also used by volunteer for editing)
router.get('/:classId', protect, requireRole('student', 'volunteer'), getClassById);
router.post('/:classId/register', protect, requireRole('student'), registerForClass);

module.exports = router;
