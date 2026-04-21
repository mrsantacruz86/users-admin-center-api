import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Idea from '../models/Idea.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Diagnostic: print the database name and a sample count of Idea documents
    try {
      const dbName =
        conn.connection.name || conn.connection.client.s.options.dbName;
      const ideaCount = await Idea.countDocuments();
      console.log(`Connected DB: ${dbName} — Idea documents: ${ideaCount}`);
    } catch (diagErr) {
      console.warn('Diagnostic check failed:', diagErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
