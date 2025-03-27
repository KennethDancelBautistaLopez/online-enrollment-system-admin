import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDB = async () => {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env file");
        throw new Error("Database URI is missing");
    }

    if (mongoose.connection.readyState >= 1) {
        console.log("🔄 Already connected to MongoDB");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw new Error("Database connection failed");
    }
};
