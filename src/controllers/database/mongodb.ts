import mongoose from "mongoose";

export async function connectDatabase(){
    try {
        const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/recipefinder";
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); 
    }
}