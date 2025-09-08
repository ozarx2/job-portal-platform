const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  try {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    cachedConnection = mongoose.connection;
    console.log('MongoDB connected');
    return cachedConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;