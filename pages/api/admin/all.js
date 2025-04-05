// pages/api/admin/all.js
import { getSession } from "next-auth/react";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User"; // Adjust the import path to your actual User model

export default async function handler(req, res) {
  await connectToDB();

  const session = await getSession({ req });

  // Only allow superAdmin to access
  if (!session || session.user.role !== "superAdmin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const admins = await User.find({ role: { $in: ["admin", "superAdmin"] } }).select("email role _id");
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ message: "Failed to fetch admin users" });
  }
}
