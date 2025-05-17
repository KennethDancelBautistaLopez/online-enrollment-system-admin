// pages/api/subject-mappings.js
import { connectToDB } from "@/lib/mongoose";
import Curriculum from "@/models/Subject";
import { getServerSession } from "next-auth";
import authOptions from "@/pages/api/auth/[...nextauth]";
import ArchiveCurriculum from "@/models/ArchiveSubject";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectToDB();
  const session = await getServerSession(req, res, authOptions);
  if (!session.user) return res.status(401).json({ error: "Unauthorized" });
  const user = await User.findOne({ email: session.user.email });
  if (req.method === "POST") {
    const { course, yearLevel, semester, subjects } = req.body;

    try {
      // Convert yearLevel to a number to ensure consistency
      const yearLevelNumber = Number(yearLevel);

      // Check if the curriculum already exists
      let curriculum = await Curriculum.findOne({
        course,
        yearLevel: yearLevelNumber,
        semester,
      });

      if (curriculum) {
        // Loop through the subjects and add them
        for (let newSubject of subjects) {
          // Check if the subject code already exists in the current curriculum
          const duplicateSubject = curriculum.subjects.find(
            (subject) => subject.code === newSubject.code
          );

          if (duplicateSubject) {
            return res.status(409).json({
              success: false,
              error: `Subject code '${newSubject.code}' already exists in ${course} - Year ${yearLevelNumber} - ${semester}.`,
            });
          }

          // Add the new subject if no duplicate is found
          curriculum.subjects.push(newSubject);
        }
        curriculum._auditUser = {
          id: user.id,
          email: user.email,
        };
        curriculum._auditMeta = {
          ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        };
        await curriculum.save();
        return res.status(200).json({ success: true, data: curriculum });
      }

      // Validate required fields for creating a new curriculum
      if (!course || !yearLevel || !semester || !Array.isArray(subjects)) {
        return res.status(400).json({ success: false, error: "Invalid data" });
      }

      // Create a new curriculum if it doesn't exist
      curriculum = await Curriculum.auditCreate(
        {
          course,
          yearLevel: yearLevelNumber,
          semester,
          subjects,
        },
        {
          id: user.id,
          email: user.email,
        },
        {
          ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        }
      );
      return res.status(201).json({ success: true, data: curriculum });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const { getAllCourseStructure } = req.query;

      console.log(getAllCourseStructure);

      if (getAllCourseStructure === "true") {
        // Fetch all distinct courses
        const courses = await Curriculum.distinct("course");
        const courseStructure = [];

        for (const course of courses) {
          const yearLevels = await Curriculum.distinct("yearLevel", { course });

          const yearLevelData = await Promise.all(
            yearLevels.map(async (yearLevel) => {
              const semesters = await Curriculum.distinct("semester", {
                course,
                yearLevel,
              });

              const semesterData = await Promise.all(
                semesters.map(async (semester) => {
                  const curriculum = await Curriculum.findOne({
                    course,
                    yearLevel,
                    semester,
                  });
                  const subjects = curriculum ? curriculum.subjects : [];
                  return { semester, subjects };
                })
              );

              return { yearLevel, semesters: semesterData };
            })
          );

          courseStructure.push({ course, yearLevels: yearLevelData });
        }

        return res.status(200).json({ success: true, data: courseStructure });
      }

      // Default: Return all curricula without structure
      const allCurricula = await Curriculum.find();
      res.status(200).json({ success: true, data: allCurricula });
    } catch (error) {
      console.error("Error fetching course structure:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch course structure" });
    }
  } else if (req.method === "DELETE") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) {
        return res
          .status(401)
          .json({ error: "Unauthorized: User not authenticated" });
      }

      const userId = session.user.email;

      const { subjectId, curriculumId } = req.query;
      console.log("Deleting subject:", subjectId, curriculumId);

      if (!subjectId || !curriculumId) {
        return res.status(400).json({
          success: false,
          error: "Subject ID and Curriculum ID are required",
        });
      }

      try {
        // Find all curricula for the given course
        // const curricula = await Curriculum.find({ course: curriculumId });
        const curriculum = await Curriculum.findById(curriculumId);

        if (!curriculum) {
          return res
            .status(404)
            .json({ success: false, error: "Curriculum not found" });
        }

        // Find the subject to be removed
        const subjectToRemove = curriculum.subjects.find(
          (subject) => subject._id.toString() === subjectId
        );

        if (!subjectToRemove) {
          return res
            .status(404)
            .json({ success: false, error: "Subject not found in curriculum" });
        }

        await ArchiveCurriculum.auditCreate(
          {
            course: curriculum.course,
            yearLevel: curriculum.yearLevel,
            semester: curriculum.semester,
            subjects: [subjectToRemove], // Wrap in array to match schema
            originalId: curriculum._id,
            deletedBy: userId,
            deletedAt: new Date(),
          },
          {
            id: user.id,
            email: user.email,
          },
          {
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
          }
        );

        // Filter out the subject to be deleted
        curriculum.subjects = curriculum.subjects.filter(
          (subject) => subject._id.toString() !== subjectId
        );
        await curriculum.save();

        return res.status(200).json({
          success: true,
          message: "Subject archived and deleted successfully",
        });
      } catch (error) {
        console.error("Error archiving/deleting subject:", error);
        return res
          .status(500)
          .json({ success: false, error: "Failed to delete subject" });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
