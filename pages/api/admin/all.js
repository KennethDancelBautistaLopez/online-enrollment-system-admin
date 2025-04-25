// pages/api/admin/all.js
import { getSession } from "next-auth/react";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    try {
      const admins = await User.find({ role: { $in: ["admin", "superAdmin"] } }).select("email role _id");
      res.status(200).json({ admins });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
