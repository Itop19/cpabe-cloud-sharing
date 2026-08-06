const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const DEFAULT_JWT_SECRET = process.env.JWT_SECRET || 'dev-local-jwt-secret-change-me';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, username: user.username }, DEFAULT_JWT_SECRET, { expiresIn: '8h' });
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, DEFAULT_JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { signToken, hashPassword, comparePassword, authenticate };
