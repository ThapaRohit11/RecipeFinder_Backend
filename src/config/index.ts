// src/config/index.ts
import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// ✅ IMPORTANT: Your .env uses MONGO_URI, not MONGODB_URI
export const MONGODB_URI: string = process.env.MONGO_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGO_URI is missing in .env");
}

export const JWT_SECRET: string = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const BCRYPT_SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;