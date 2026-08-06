const AuditLog = require('../models/AuditLog');

async function logAudit({ userId, username, action, details, outcome }) {
  try {
    await AuditLog.create({ userId, username, action, details, outcome });
  } catch (error) {
    console.warn('Audit logging failed:', error.message);
  }
}

module.exports = { logAudit };
