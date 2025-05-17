// pages/api/subjects.js
import { connectToDB } from "@/lib/mongoose";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import authOptions from "@/pages/api/auth/[...nextauth]";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDB();
  const method = req.method;
  const studentId = req.query.id;
  const session = await getServerSession(req, res, authOptions);
  if (!session.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findOne({ email: session.user.email });

  if (method === "GET") {
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      return res.status(200).json(student);
    } catch (error) {
      console.error("Error fetching student data:", error);
      return res.status(500).json({ error: "Failed to fetch subjects" });
    }
  } else if (method === "POST") {
    const { code, description } = req.body;
    if (!code || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      await Student.findByIdAndUpdate(student._id, {
        $pull: { subjects: { code } },
      });

      const exists = student.subjects.some(
        (subject) =>
          subject.description.toLowerCase() === description.toLowerCase()
      );
      if (exists) {
        return res.status(400).json({ error: "Subject already exists" });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        { $push: { subjects: req.body } },
        { new: true }
      );

      return res.status(200).json(updatedStudent);
    } catch (error) {
      console.error("Error adding subject:", error);
      return res.status(500).json({ error: "Failed to add subject" });
    }
  } else if (method === "DELETE") {
    const { code } = req.query;
    console.log(code);
    if (!studentId || !code) {
      return res
        .status(400)
        .json({ error: "Missing studentId or subjectCode" });
    }

    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const subjectToDelete = student.subjects.find((s) => s.code === code);
      console.log(subjectToDelete);
      if (!subjectToDelete) {
        return res
          .status(404)
          .json({ error: "Subject not found in student record" });
      }

      const archivedSubject = {
        ...subjectToDelete.toObject(),
        deletedAt: new Date(),
        deletedBy: user.email,
      };

      console.log("Archived subject:", archivedSubject);

      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        {
          $pull: { subjects: { code: code } },
          $push: { archivedSubjects: archivedSubject },
        },
        {
          new: true,
          _auditUser: {
            id: user.id,
            email: user.email,
          },
          _auditMeta: {
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        }
      );

      console.log("Updated student:", updatedStudent);

      return res.status(200).json(updatedStudent);
    } catch (error) {
      console.error("Error deleting subject:", error);
      return res.status(500).json({ error: "Failed to delete subject" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
