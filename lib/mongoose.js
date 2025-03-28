import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in .env file");
    throw new Error("Database URI is missing");
}

// Global variable to track the connection (important for serverless environments)
let cachedConnection = global.mongooseConnection;

if (!cachedConnection) {
    cachedConnection = global.mongooseConnection = { conn: null, promise: null };
}

export const connectToDB = async () => {
    if (cachedConnection.conn) {
        console.log("🔄 Using existing MongoDB connection");
        return cachedConnection.conn;
    }

    if (!cachedConnection.promise) {
        console.log("🔗 Connecting to MongoDB...");
        cachedConnection.promise = mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    try {
        cachedConnection.conn = await cachedConnection.promise;
        console.log("✅ Connected to MongoDB");
        return cachedConnection.conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        cachedConnection.promise = null;
        throw new Error("Database connection failed");
    }
};
