const User = require('../models/User');
const Attribute = require('../models/Attribute');

async function listUsers(req, res) {
  try {
    const users = await User.find().populate('attributes');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createUser(req, res) {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function assignAttributes(req, res) {
  try {
    const { attributeIds } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { attributes: attributeIds }, { new: true }).populate('attributes');
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { listUsers, createUser, updateUser, deleteUser, assignAttributes };
