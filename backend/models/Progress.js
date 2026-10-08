const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    skillId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    currentLevel: { type: Number, min: 1, max: 10, default: 1 },
    completedLevels: [
      {
        levelNumber: { type: Number, min: 1, max: 10, required: true },
        score: { type: Number, min: 0, max: 100, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    totalXp: { type: Number, min: 0, default: 0 },
    isCourseCompleted: { type: Boolean, default: false },
    certificateId: { type: String, unique: true, sparse: true },
    certificateIssuedAt: { type: Date },
    // Kept for compatibility with the previous module-completion API.
    completedModules: [
      {
        moduleId: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ studentId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
