const mongoose = require('mongoose');

/**
 * Phase 7 — Weekend / Holiday community class
 */
const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    skill: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    linkUrl: { type: String, trim: true, default: '' },
    fileData: { type: String, default: '' },
    fileName: { type: String, trim: true, default: '' },
    date: { type: String, required: true }, // ISO YYYY-MM-DD
    day: {
      type: String,
      required: true,
      enum: ['Saturday', 'Sunday', 'Holiday'],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    facilitator: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registeredStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    ],
  },
  { timestamps: true }
);

classSchema.virtual('availableSeats').get(function availableSeats() {
  return Math.max(0, this.capacity - (this.registeredStudents?.length || 0));
});

classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Class', classSchema);
