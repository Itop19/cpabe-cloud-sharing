const axios = require('axios');

function getBaseUrl() {
  return process.env.CPABE_SERVICE_URL || 'http://127.0.0.1:8000';
}

async function postToService(pathname, payload = {}) {
  const baseUrl = getBaseUrl();
  try {
    const response = await axios.post(`${baseUrl}${pathname}`, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Flask service is unavailable.';
    throw new Error(message);
  }
}

async function generateParams() {
  return postToService('/generate-params');
}

async function generateUserKey(attributes) {
  return postToService('/generate-user-key', { attributes });
}

async function encryptFile({ fileBuffer, policy, filename }) {
  return postToService('/encrypt', {
    filename,
    policy,
    fileBuffer: fileBuffer.toString('base64')
  });
}

async function decryptFile({ ciphertext, key }) {
  return postToService('/decrypt', { ciphertext, key });
}

module.exports = { generateParams, generateUserKey, encryptFile, decryptFile };
