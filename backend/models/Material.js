const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    skill: { type: String, required: true, trim: true },
    contentType: { type: String, trim: true, default: 'Custom' },
    linkUrl: { type: String, trim: true, default: '' },
    fileData: { type: String, default: '' },
    fileName: { type: String, default: '' },
    language: { type: String, trim: true, default: 'Tamil' },
    description: { type: String, trim: true, default: '' },
    contentNotes: { type: String, trim: true, default: '' },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      required: true,
    },
    uploaderName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
