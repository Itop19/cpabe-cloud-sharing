const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('health endpoint works', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});

test('register endpoint creates user', async () => {
  const username = `alice_${Date.now()}`;
  const email = `${username}@example.com`;
  const response = await request(app).post('/api/auth/register').send({ username, email, password: 'secret123', role: 'data_owner' });
  assert.equal(response.status, 201);
  assert.ok(response.body.token);
});
