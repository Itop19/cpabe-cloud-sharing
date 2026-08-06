const AccessPolicy = require('../models/AccessPolicy');

async function listPolicies(req, res) {
  try {
    const policies = await AccessPolicy.find();
    return res.json(policies);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createPolicy(req, res) {
  try {
    const policy = await AccessPolicy.create({ ...req.body, createdBy: req.user?.id });
    return res.status(201).json(policy);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updatePolicy(req, res) {
  try {
    const policy = await AccessPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(policy);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deletePolicy(req, res) {
  try {
    await AccessPolicy.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Policy deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { listPolicies, createPolicy, updatePolicy, deletePolicy };
