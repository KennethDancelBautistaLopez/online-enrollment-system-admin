import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect(); // Connect to MongoDB

    const email = "admin@example.com";
    const plainPassword = "admin123"; // This is the actual password you'll use
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ message: "Admin user created!", token });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
