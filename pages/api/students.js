import { connectToDB } from "@/lib/mongoose";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { hash } from "bcryptjs";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mailer";
import Curriculum from "@/models/Subject";
import ArchiveStudent from "@/models/ArchiveStudent";
import { getServerSession } from "next-auth";
import authOptions from "@/pages/api/auth/[...nextauth]";
import User from "@/models/User";

async function handler(req, res) {
  await connectToDB();
  const session = await getServerSession(req, res, authOptions);
  if (!session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ email: session.user.email });
  const { method } = req;
  if (method === "GET") {
    try {
      const { id } = req.query;

      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid student ID format" });
        }
        const student = await Student.findOne({
          $or: [{ _id: id }, { _studentId: id }],
        });
        if (!student) {
          console.log("Student not found:", id);
          return res.status(404).json({ error: "Student not found" });
        }
        return res.status(200).json(student);
      } else {
        const students = await Student.find();
        return res.status(200).json(students);
      }
    } catch (error) {
      console.error("Error in GET /students:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
  if (req.method === "POST") {
    try {
      const {
        fname,
        mname,
        lname,
        address,
        mobile,
        landline,
        facebook,
        birthdate,
        birthplace,
        nationality,
        religion,
        sex,
        father,
        mother,
        guardian,
        guardianOccupation,
        registrationDate,
        lrn,
        education,
        course,
        yearLevel,
        schoolYear,
        email,
        password,
        semester,
        nursery,
        elementary,
        juniorHigh,
        seniorHigh,
      } = req.body;
      const { yearAttended: nurseryYear, schoolName: nurserySchool } = nursery;
      const { yearAttended: elementaryYear, schoolName: elementarySchool } =
        elementary;
      const { yearAttended: juniorHighYear, schoolName: juniorHighSchool } =
        juniorHigh;
      const { yearAttended: seniorHighYear, schoolName: seniorHighSchool } =
        seniorHigh;
      if (
        !fname ||
        !lname ||
        !address ||
        !mobile ||
        !facebook ||
        !birthdate ||
        !birthplace ||
        !nationality ||
        !religion ||
        !sex ||
        !guardian ||
        !guardianOccupation ||
        !registrationDate ||
        !education ||
        !yearLevel ||
        !schoolYear ||
        !email ||
        !password ||
        !semester
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // email no space allowed
      if (email.includes(" ")) {
        return res.status(400).json({ error: "Email must not contain spaces" });
      }
      const mobileRegex = /^\d{4}-\d{3}-\d{4}$/;
      if (!mobileRegex.test(mobile)) {
        return res
          .status(400)
          .json({ error: "Invalid mobile number format 11 digits" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const hashedPassword = await hash(password, 10);
      const currentYear = new Date().getFullYear();
      const lastStudent = await Student.findOne({
        _studentId: new RegExp(`^${currentYear}-`),
      }).sort({ _studentId: -1 });
      let nextNumber = "0001";
      if (lastStudent) {
        const lastNumber = parseInt(lastStudent._studentId.split("-")[1], 10);
        nextNumber = String(lastNumber + 1).padStart(4, "0");
      }
      const newStudentNumber = `${currentYear}-${nextNumber}`;
      const curriculum = await Curriculum.findOne({
        course,
        yearLevel: String(yearLevel),
        semester,
      });
      const subjects =
        curriculum?.subjects?.map((subj) => ({
          code: subj.code,
          description: subj.description,
          units: subj.units,
        })) || [];
      const newStudent = await Student.auditCreate(
        {
          _studentId: newStudentNumber,
          fname,
          mname,
          lname,
          address,
          mobile,
          landline,
          facebook,
          birthdate,
          birthplace,
          nationality,
          religion,
          sex,
          father,
          mother,
          guardian,
          guardianOccupation,
          registrationDate,
          lrn,
          education,
          course,
          yearLevel,
          schoolYear,
          email,
          status: "missing files",
          password: hashedPassword,
          nursery: { schoolName: nurserySchool, yearAttended: nurseryYear },
          elementary: {
            schoolName: elementarySchool,
            yearAttended: elementaryYear,
          },
          juniorHigh: {
            schoolName: juniorHighSchool,
            yearAttended: juniorHighYear,
          },
          seniorHigh: {
            schoolName: seniorHighSchool,
            yearAttended: seniorHighYear,
          },
          semester,
          subjects,
          verified: false,
          studentType: "new",
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
      const token = jwt.sign(
        {
          userId: newStudent._id,
          // email: newStudent.email, role: "student", studentId: newStudent._studentId, studentNumber: newStudent.studentNumber
        },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      await sendVerificationEmail(newStudent.email, token);
      await sendVerificationEmail(newStudent.email, token);

      return res.status(201).json({
        message: "Student added successfully",
        token,
        student: {
          _studentId: newStudent._studentId,
          studentNumber: newStudent.studentNumber,
          fname: newStudent.fname,
          mname: newStudent.mname,
          lname: newStudent.lname,
          email: newStudent.email,
          course: newStudent.course,
          yearLevel: newStudent.yearLevel,
          semester: newStudent.semester,
          schoolYear: newStudent.schoolYear,
          subjects: newStudent.subjects,
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to add student", details: error.message });
    }
  }
  if (method === "PUT") {
    try {
      const { id } = req.query;
      const updatedData = req.body;
      if (!id) return res.status(400).json({ error: "Student ID is required" });
      if (updatedData.password) {
        const isHashed = /^\$2[aby]\$[\d]+\$/.test(updatedData.password);
        if (!isHashed) {
          const salt = await bcrypt.genSalt(10);
          updatedData.password = await bcrypt.hash(updatedData.password, salt);
        }
      }
      const student = await Student.findOne({ _studentId: id });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const courseChanged =
        updatedData.course && updatedData.course !== student.course;
      const yearLevelChanged =
        updatedData.yearLevel && updatedData.yearLevel !== student.yearLevel;
      const semesterChanged =
        updatedData.semester && updatedData.semester !== student.semester;

      if (courseChanged || yearLevelChanged || semesterChanged) {
        const course = updatedData.course || student.course;
        const yearLevel = updatedData.yearLevel || student.yearLevel;
        const semester = updatedData.semester || student.semester;

        const curriculum = await Curriculum.findOne({
          course,
          yearLevel: String(yearLevel),
          semester,
        });

        updatedData.subjects = curriculum?.subjects || [];
      }

      const updatedStudent = await Student.findOneAndUpdate(
        { _studentId: id },
        updatedData,
        {
          new: true,
          runValidators: true,
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

      return res.status(200).json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
  if (method === "DELETE") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session.user) {
        return res
          .status(401)
          .json({ error: "Unauthorized: User not authenticated" });
      }

      const userId = session.user.email;
      console.log("User ID:", userId);
      const { id } = req.query;
      if (!id) {
        return res
          .status(400)
          .json({ error: "Student ID is required for deletion" });
      }

      const student = await Student.findOne({
        $or: [{ _studentId: id }, { _id: id }],
      });

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Archive the student before deletion
      const studentObj = student.toObject();
      const { _id, ...rest } = studentObj;

      const archived = await ArchiveStudent.auditCreate(
        {
          ...rest,
          originalId: _id,
          DeletedBy: userId,
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

      console.log("Archived student:", archived);

      // Delete the student
      await Student.deleteOne({ _id });

      return res.status(200).json({
        message: "Student archived and deleted successfully",
        archivedStudent: archived,
      });
    } catch (error) {
      console.error("Error archiving/deleting student:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
export default handler;
