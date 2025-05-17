// pages/api/admin/all.js
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    try {
      const admins = await User.find({
        role: {
          $in: [
            "admin",
            "superAdmin",
            "registrar",
            "accountant",
            "programHeads",
          ],
        },
      }).select("email role isActive _id");

      return res.status(200).json({ admins });
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch admin users" });
    }
  }

  /* ---------- PATCH  /api/admin/all?id=xxxx  ---------- */
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { isActive } = req.body;

    if (!id) return res.status(400).json({ message: "Missing user id" });
    if (typeof isActive !== "boolean")
      return res.status(400).json({ message: "isActive must be boolean" });

    try {
      /* ---- first load the target user ---- */
      const target = await User.findById(id).select("role isActive email");
      if (!target) return res.status(404).json({ message: "Admin not found" });

      /* ---- block changes to superAdmin ---- */
      if (target.role === "superAdmin") {
        return res
          .status(403)
          .json({ message: "Cannot change active status of a superAdmin" });
      }

      /* ---- proceed with update ---- */
      target.isActive = isActive;
      await target.save();

      return res.status(200).json({ user: target });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update admin" });
    }
  }

  /* ---------- Method not allowed ---------- */
  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
