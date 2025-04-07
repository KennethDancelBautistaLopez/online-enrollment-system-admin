// pages/api/admin/create.js
import { hash } from "bcryptjs"; // Import bcrypt for password hashing
import { createAdminInDatabase } from "@/lib/admin"; // Your DB logic
import jwt from "jsonwebtoken"; // Import jsonwebtoken for creating the token

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password, role } = req.body;

      // Hash the password before storing it in the database
      const hashedPassword = await hash(password, 12);

      // Create a new admin user
      const newAdmin = await createAdminInDatabase(email, hashedPassword, role);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newAdmin._id, email: newAdmin.email, role: newAdmin.role }, 
        process.env.JWT_SECRET, // Use a secret stored in environment variables
        { expiresIn: '7d' } // Token expiration time (1 hour)
      );

      // Respond with the created admin data and the token
      res.status(201).json({ message: "Admin created successfully", user: newAdmin, token });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
