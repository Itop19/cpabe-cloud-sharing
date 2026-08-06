const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, default: '' },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  outcome: { type: String, default: 'success' }
}, { timestamps: true });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
