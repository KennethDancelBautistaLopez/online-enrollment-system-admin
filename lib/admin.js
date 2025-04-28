// lib/db.js
import { connectToDB } from "./mongoose"; // Your MongoDB connection logic
import User from "@/models/User"; // Import your User model

// Create new admin
export const createAdminInDatabase = async (email, hashedPassword, role = "admin") => {
  try {
    // Ensure you're connected to the database
    await connectToDB();

    // Create a new user (admin)
    const newAdmin = new User({
      email,
      password: hashedPassword, // Ensure to hash the password
      role, // Default role is admin, can also be "superAdmin"
    });

    // Save the new admin to the database
    await newAdmin.save();

    return newAdmin;
  } catch (error) {
    console.error("❌ Error creating admin in database:", error);
    throw new Error("Error creating admin");
  }
};

export const findByEmail = async (email) => {
  try {
    // Ensure you're connected to the database
    await connectToDB();

    // Find admin by email
    const admin = await User.findOne({ email });

    return admin;
  } catch (error) {
    console.error("❌ Error finding admin by email:", error);
    throw new Error("Error finding admin by email");
  }
};