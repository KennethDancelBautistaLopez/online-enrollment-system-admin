// pages/api/admin/create.js
import { hash } from "bcryptjs"; // Import bcrypt for password hashing
import { createAdminInDatabase } from "@/lib/admin"; // Your DB logic

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password, role } = req.body;

      // Hash the password before storing it in the database
      const hashedPassword = await hash(password, 12);

      // Create a new admin user
      const newAdmin = await createAdminInDatabase(email, hashedPassword, role);

      // Respond with the created admin data
      res.status(201).json({ message: "Admin created successfully", user: newAdmin });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
