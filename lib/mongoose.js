import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // Already connected
    }
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Database connection failed");
    }
};
