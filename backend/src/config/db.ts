import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
      throw new Error("MONGO_URI is not set in environment variables");
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for Render
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Added connection timeout
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ MongoDB connection error:", errorMessage);
    console.error("💡 Check your MONGO_URI in the Render environment variables");
    // Don't exit - let server continue running for health checks
    throw error; // Re-throw so caller can handle it
  }
};

export default connectDB;
