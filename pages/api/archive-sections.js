// pages/api/archive-sections.js
import { connectToDB } from "@/lib/mongoose";
import ArchiveSection from "@/models/ArchiveSection";
import Section from "@/models/Section"; // live collection

export default async function handler(req, res) {
  await connectToDB();
  const { id } = req.query;

  // 1️⃣ ----------- GET /api/archive-sections -------------
  if (req.method === "GET" && !id) {
    const docs = await ArchiveSection.find()
      .populate("students", "fname lname") // optional: show student names
      .lean();
    return res.status(200).json(docs);
  }

  // 2️⃣ ----------- PATCH /api/archive-sections/:id -------------
  if (req.method === "PATCH" && id) {
    const archived = await ArchiveSection.findById(id);
    if (!archived) return res.status(404).json({ message: "Not found" });

    const { _id, deletedAt, deletedBy, ...data } = archived.toObject();
    await Section.create({ ...data, restoredFromArchive: _id });
    await archived.deleteOne();

    return res.status(200).json({ restored: true });
  }

  // 3️⃣ ----------- DELETE /api/archive-sections/:id -------------
  if (req.method === "DELETE" && id) {
    const deleted = await ArchiveSection.findByIdAndDelete(id);
    return deleted
      ? res.status(200).json({ deleted: true })
      : res.status(404).json({ message: "Not found" });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
