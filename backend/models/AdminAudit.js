const mongoose = require('mongoose');

const adminAuditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    resourceSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    outcome: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
