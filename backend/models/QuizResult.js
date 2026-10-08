const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    performance: { type: String, required: true },
    answers: [{ type: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
