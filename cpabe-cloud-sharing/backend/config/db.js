const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

async function connectDb() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI is not set. Falling back to localhost MongoDB for development.');
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(DEFAULT_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed; continuing without a persistent database.', error.message);
  }
}

module.exports = connectDb;
