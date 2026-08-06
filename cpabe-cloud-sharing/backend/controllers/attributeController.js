const Attribute = require('../models/Attribute');

async function listAttributes(req, res) {
  try {
    const attributes = await Attribute.find();
    return res.json(attributes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createAttribute(req, res) {
  try {
    const attribute = await Attribute.create(req.body);
    return res.status(201).json(attribute);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateAttribute(req, res) {
  try {
    const attribute = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(attribute);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteAttribute(req, res) {
  try {
    await Attribute.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Attribute deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { listAttributes, createAttribute, updateAttribute, deleteAttribute };
