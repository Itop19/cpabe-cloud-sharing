const mongoose = require('mongoose');

const accessPolicySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  expression: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.AccessPolicy || mongoose.model('AccessPolicy', accessPolicySchema);
