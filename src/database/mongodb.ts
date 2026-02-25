import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/recipefinder";

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB connected successfully (${MONGO_URI})`);
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed. Falling back to in-memory MongoDB.");

    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }

    const inMemoryUri = memoryServer.getUri("recipefinder");
    await mongoose.connect(inMemoryUri);
    console.log("✅ In-memory MongoDB started for local development");
  }
};
