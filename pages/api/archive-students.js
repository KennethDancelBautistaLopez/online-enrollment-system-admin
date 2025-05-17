import { connectToDB } from "@/lib/mongoose";
import ArchiveStudent from "@/models/ArchiveStudent";
import Student from "@/models/Student"; // live collection

export default async function handler(req, res) {
  await connectToDB();

  const { id } = req.query;

  // 1️⃣ ----------- GET /api/archive-students -------------
  if (req.method === "GET" && !id) {
    const docs = await ArchiveStudent.find().lean();
    return res.status(200).json(docs);
  }

  // 2️⃣ ----------- PATCH /api/archive-students/:id -------------
  if (req.method === "PATCH" && id) {
    const archived = await ArchiveStudent.findById(id);
    if (!archived) return res.status(404).json({ message: "Not found" });

    const { _id, deletedAt, DeletedBy, ...data } = archived.toObject();
    await Student.create({ ...data, restoredFromArchive: _id });
    await archived.deleteOne();

    return res.status(200).json({ restored: true });
  }

  // 3️⃣ ----------- DELETE /api/archive-students/:id -------------
  if (req.method === "DELETE" && id) {
    const deleted = await ArchiveStudent.findByIdAndDelete(id);
    return deleted
      ? res.status(200).json({ deleted: true })
      : res.status(404).json({ message: "Not found" });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
