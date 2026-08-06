const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Attribute || mongoose.model('Attribute', attributeSchema);
