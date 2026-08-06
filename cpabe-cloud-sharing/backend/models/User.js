const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'data_consumer' },
  attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' }]
}, { timestamps: true });

userSchema.pre('save', function normalizeUserFields(next) {
  if (this.username) this.username = String(this.username).trim().toLowerCase();
  if (this.email) this.email = String(this.email).trim().toLowerCase();
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
