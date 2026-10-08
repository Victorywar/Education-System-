const Student = require('../models/Student');
const Course = require('../models/Course');
const { recommendCourses } = require('../services/recommendationEngine');

const getRecommendations = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student.assessmentCompleted) {
      return res.status(400).json({
        message: 'Please complete the interest assessment first.',
        assessmentCompleted: false,
      });
    }

    if (student.recommendations && student.recommendations.length > 0) {
      return res.json({ recommendations: student.recommendations });
    }

    const courses = await Course.find();
    const recommendations = recommendCourses(student.assessmentAnswers, courses);
    student.recommendations = recommendations;
    student.recommendedSkill = recommendations[0]?.course || '';
    await student.save();

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations };
