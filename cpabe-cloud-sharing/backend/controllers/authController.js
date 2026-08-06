const User = require('../models/User');
const { hashPassword, comparePassword, signToken } = require('../utils/auth');
const { logAudit } = require('../services/auditService');

async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: await hashPassword(password),
      role: role || 'data_consumer'
    });

    await logAudit({ username: user.username, action: 'register', outcome: 'success' });
    return res.status(201).json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token: signToken(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account right now. Please try again later.' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user || !await comparePassword(password, user.password)) {
      await logAudit({ username: normalizedUsername, action: 'login', outcome: 'failure' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await logAudit({ userId: user._id, username: user.username, action: 'login', outcome: 'success' });
    return res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token: signToken(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to sign in right now. Please try again later.' });
  }
}

module.exports = { register, login };
