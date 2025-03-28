import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in .env file");
    throw new Error("Database URI is missing");
}

// Cache the connection to prevent multiple connections in serverless environments
let cached = global.mongooseConnection;

if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}

export const connectToDB = async () => {
    if (cached.conn) {
        console.log("🔄 Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔗 Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // ⏳ Timeout if MongoDB doesn't respond within 5s
            socketTimeoutMS: 45000, // 🕒 Keep connection open for 45s
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ Connected to MongoDB");
        return cached.conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        cached.promise = null;
        throw new Error("Database connection failed");
    }
};
