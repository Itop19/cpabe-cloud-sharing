const AuditLog = require('../models/AuditLog');

async function listAuditLogs(req, res) {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { listAuditLogs };
