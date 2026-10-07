import mongoose from 'mongoose';

let isConnected = false;
let fallbackMode = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fieldsense_ai';

  try {
    mongoose.set('strictQuery', false);
    // Connect with a short timeout so that if local MongoDB isn't running, it falls back instantly
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    fallbackMode = false;
    console.log(`[Database] MongoDB connected successfully to: ${mongoURI}`);
  } catch (error) {
    isConnected = false;
    fallbackMode = true;
    console.warn(`[Database] MongoDB connection unavailable (${error.message}).`);
    console.log(`[Database] Activating high-performance local store fallback. FieldSense AI is fully operational!`);
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  fallbackMode: fallbackMode,
  driver: fallbackMode ? 'in-memory-storage' : 'mongodb',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fieldsense_ai'
});
