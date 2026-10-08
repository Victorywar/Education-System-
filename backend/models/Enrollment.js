const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, default: 'registered' },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, classSession: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
