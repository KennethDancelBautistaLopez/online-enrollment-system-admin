// pages/api/admin/delete.js
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query; // Access ID from the query

  await connectToDB();

  try {
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Server error" });
  }
}
