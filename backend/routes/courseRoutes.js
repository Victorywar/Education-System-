const express = require('express');
const { getCourses, getCourseById, getLearningModule } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/:courseId', protect, getCourseById);
router.get('/:courseId/learn', protect, getLearningModule);

module.exports = router;
