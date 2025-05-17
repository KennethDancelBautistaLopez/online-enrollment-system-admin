// pages/api/admin/create.js
import { hash } from "bcryptjs";
import { createAdminInDatabase, findByEmail } from "@/lib/admin";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email.length > 50) {
      return res.status(400).json({ message: "Email is too long" });
    }

    // Check if email contains "admin" (case-insensitive)
    if (/admin/i.test(email)) {
      return res.status(400).json({ message: "Email cannot contain 'admin'" });
    }

    // Check if email is already in use
    const existingAdmin = await findByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    // Role validation (allow only specific roles)
    const allowedRoles = ["admin", "superAdmin", "registrar", "accountant","programHeads"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Password validation
    const passwordMinLength = 8;
    const passwordMaxLength = 32;
    if (password.length < passwordMinLength || password.length > passwordMaxLength) {
      return res.status(400).json({ 
        message: `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters` 
      });
    }

    // Strong password requirements (at least one letter, one number, one special character)
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one letter, one number, and one special character" 
      });
    }

    // Prevent common weak passwords
    const weakPasswords = [
      "password", "admin", "123456", "admin123", 
      "qwerty", "letmein", "12345678"
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({ message: "Password is too weak" });
    }

    // Hash the password and create the admin
    const hashedPassword = await hash(password, 12);
    const newAdmin = await createAdminInDatabase(email, hashedPassword, role);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "Admin created successfully", user: newAdmin, token });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    res.status(500).json({ message: "Failed to create admin", error: error.message });
  }
}
