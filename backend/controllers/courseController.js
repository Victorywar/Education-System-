const Course = require('../models/Course');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('-quiz');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select('-quiz');
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLearningModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select('-quiz');
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const moduleIndex = parseInt(req.query.module || '0', 10);
    if (moduleIndex < 0 || moduleIndex >= course.modules.length) {
      return res.status(400).json({ message: 'Invalid module index.' });
    }

    res.json({
      courseId: course._id,
      courseName: course.name,
      moduleIndex,
      totalModules: course.modules.length,
      module: course.modules[moduleIndex],
      isLast: moduleIndex === course.modules.length - 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourseById, getLearningModule };
