const fs = require('fs');
const path = require('path');
const multer = require('multer');
const File = require('../models/File');
const { encryptFile, decryptFile } = require('../services/cpabeService');
const { logAudit } = require('../services/auditService');

const uploadDir = process.env.UPLOAD_DIR || './uploads';

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },

  filename: function (_req, file, cb) {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file was uploaded.'
      });
    }

    const file = req.file;

    const fileBuffer = fs.readFileSync(file.path);

    const policy =
      req.body.policy ||
      '((Department=CS AND Role=Student) OR (ResearchGroup=AI))';

    const encrypted = await encryptFile({
      fileBuffer,
      policy,
      filename: file.originalname
    });

    const storedPath = path.join(
      uploadDir,
      `${Date.now()}-${file.originalname}.enc`
    );

    fs.writeFileSync(
      storedPath,
      Buffer.from(encrypted.ciphertext, 'base64')
    );

    const record = await File.create({
      filename: `${file.originalname}.enc`,
      originalName: file.originalname,
      storagePath: storedPath,
      encrypted: true,
      ownerId: req.user?.id,
      size: file.size
    });

    await logAudit({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'upload',
      details: file.originalname,
      outcome: 'success'
    });

    return res.status(201).json({
      message: 'File uploaded',
      file: record,
      encryption: encrypted
    });

  } catch (error) {
    console.error('UPLOAD ERROR:');
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
}

async function listFiles(req, res) {
  try {
    const files = await File.find().populate('ownerId');
    return res.json(files);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

async function downloadFile(req, res) {
  try {
    const record = await File.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: 'File not found'
      });
    }

    await logAudit({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'download',
      details: record.originalName,
      outcome: 'success'
    });

    return res.download(
      record.storagePath,
      record.originalName + '.enc'
    );

  } catch (error) {
    return res.status(500).json({
      message: 'Unable to download file right now.'
    });
  }
}

async function decryptFileRoute(req, res) {
  try {
    const { ciphertext, key } = req.body;

    const result = await decryptFile({
      ciphertext,
      key
    });

    if (result.success) {
      await logAudit({
        userId: req.user?.id,
        username: req.user?.username,
        action: 'decrypt',
        details: 'successful',
        outcome: 'success'
      });

      return res.json(result);
    }

    await logAudit({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'decrypt',
      details: 'failed',
      outcome: 'failure'
    });

    return res.status(403).json({
      message: 'Access denied',
      ...result
    });

  } catch (error) {
    console.error('DECRYPT ERROR:');
    console.error(error);

    return res.status(500).json({
      message: 'Decryption failed. Please verify your attributes and try again.'
    });
  }
}

module.exports = {
  upload,
  uploadFile,
  listFiles,
  downloadFile,
  decryptFileRoute
};
