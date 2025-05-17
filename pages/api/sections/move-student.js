// pages/api/sections/move-student.js
import { connectToDB } from "@/lib/mongoose";
import Section from "@/models/Section";
import Student from "@/models/Student";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { studentId, fromSectionId, toSectionId } = req.body;

  console.log(studentId, fromSectionId, toSectionId);

  try {
    const section = await Section.findByIdAndUpdate(fromSectionId, {
      $pull: { students: studentId },
    });

    console.log(section);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    // Add student to new section
    const newSection = await Section.findByIdAndUpdate(
      toSectionId,
      {
        $addToSet: { students: studentId },
      },
      { new: true } // ✅ crucial!
    );

    console.log(newSection);

    if (!newSection) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        section: newSection.sectionID,
      },
      { new: true }
    );

    console.log(student);

    return res
      .status(200)
      .json({ success: true, message: "Student moved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
