import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/inventry_billing";

  try {
    await mongoose.connect(mongoURI);
    console.log("🍃 MongoDB Atlas connected successfully.");
    return true;
  } catch (error) {
    console.error("⚠️ MongoDB Atlas connection error:", error.message);
    console.log("ℹ️ Continuing with Mongoose schema & repository fallback mode.");
    return false;
  }
};export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
