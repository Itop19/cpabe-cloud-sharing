require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDb = require('./config/db');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map((origin) => origin.trim()).filter(Boolean);

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. The app will use a development fallback secret for local testing.');
}
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attributeRoutes = require('./routes/attributeRoutes');
const policyRoutes = require('./routes/policyRoutes');
const fileRoutes = require('./routes/fileRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS policy does not allow this origin'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true, service: 'cpabe-backend' }));
app.use((err, _req, res, _next) => {
  if (err && err.message === 'CORS policy does not allow this origin') {
    return res.status(403).json({ message: 'This origin is not allowed by CORS policy.' });
  }
  return res.status(500).json({ message: 'Unexpected server error.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/audit', auditRoutes);

connectDb().catch((err) => {
  console.warn('Database connection unavailable, continuing with in-memory store:', err.message);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
}

module.exports = app;
