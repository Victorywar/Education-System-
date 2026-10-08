const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 5, max: 25 },
    className: { type: String, required: true, trim: true },
    school: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    guardianContact: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student', enum: ['student'] },
    lastActiveAt: { type: Date, default: Date.now },
    assessmentCompleted: { type: Boolean, default: false },
    // Phase 4 — Interest Assessment
    assessment: {
      answers: [
        {
          questionId: { type: Number },
          answer: { type: String },
          category: { type: String },
        },
      ],
      completedAt: { type: Date },
    },
    // Kept for compatibility with later recommendation phase
    assessmentAnswers: [{ type: String }],
    recommendations: [
      {
        course: String,
        score: Number,
        reason: String,
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      },
    ],
    recommendedSkill: { type: String, default: '' },
    learningProgress: {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      currentModule: { type: Number, default: 0 },
      completedModules: [{ type: Number }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
