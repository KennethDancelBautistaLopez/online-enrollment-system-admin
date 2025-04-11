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

// Delete admin
export const deleteUserFromDatabase = async (userId) => {
  try {
    // Ensure you're connected to the database
    await connectToDB();

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    console.error("❌ Error deleting admin from database:", error);
    throw new Error("Error deleting admin");
  }
};  
