const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    level: { type: String, default: 'Beginner' },
    duration: { type: String, required: true },
    interestTags: [{ type: String }],
    modules: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
        example: { type: String, required: true },
        practiceQuestion: { type: String, required: true },
      },
    ],
    quiz: [
      {
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
