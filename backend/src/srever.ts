import mongoose from "mongoose";

export const dbConnect = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in environment variables.");
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // optional: exit process if critical
  }
};
