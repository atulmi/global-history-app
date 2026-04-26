import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ?? "mongodb://localhost:27017/global-history-app";

export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected", () =>
    console.log("MongoDB connected:", MONGO_URI),
  );
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB connection error:", err),
  );

  await mongoose.connect(MONGO_URI);
}