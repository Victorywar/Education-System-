const express = require('express');
const {
  adminLogin,
  getAdminStats,
  getPendingVolunteers,
  updateVolunteerStatus,
  getAllStudents,
  getInactiveStudents,
  deleteStudentAdmin,
  getAdminClasses,
  deleteClassAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', protect, requireRole('admin'), getAdminStats);
router.get('/volunteers/pending', protect, requireRole('admin'), getPendingVolunteers);
router.put('/volunteers/:id/status', protect, requireRole('admin'), updateVolunteerStatus);
router.get('/students', protect, requireRole('admin'), getAllStudents);
router.get('/inactive-students', protect, requireRole('admin'), getInactiveStudents);
router.delete('/students/:id', protect, requireRole('admin'), deleteStudentAdmin);
router.get('/classes', protect, requireRole('admin'), getAdminClasses);
router.delete('/classes/:id', protect, requireRole('admin'), deleteClassAdmin);

module.exports = router;
