// pages/api/admin/create.js
import { hash } from "bcryptjs";
import { createAdminInDatabase } from "@/lib/admin";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password, role } = req.body;
      const hashedPassword = await hash(password, 12);
      const newAdmin = await createAdminInDatabase(email, hashedPassword, role);

      const token = jwt.sign(
        { userId: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ message: "Admin created successfully", user: newAdmin, token });
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
