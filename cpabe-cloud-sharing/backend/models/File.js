const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  storagePath: { type: String, required: true },
  encrypted: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  size: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.File || mongoose.model('File', fileSchema);
