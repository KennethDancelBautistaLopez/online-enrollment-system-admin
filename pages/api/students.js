import {connectToDB}  from "@/lib/mongoose";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


async function handler(req, res) {
  console.log("API /students called with method:", req.method);
  await connectToDB();
  const {method} = req;

  if (method === "GET") {
    try {
      if (req.query?.id) {
        const student = await Student.findOne({ _studentId: req.query.id });
        if (!student) return res.status(404).json({ error: "Student not found" });
        return res.status(200).json(student);
      } else {
        // Return all students when no ID is provided
        const students = await Student.find({});
        return res.status(200).json(students);
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }


  if (method === "POST") {
    try {
        const { 
            email, fname, mname, lname, address, mobile, landline, facebook, birthdate, 
            nationality, birthplace, religion, sex, father, mother, guardian, 
            guardianOccupation, registrationDate, lrn, education, strand, course, 
            yearLevel, schoolYear, password 
        } = req.body;

        // Validate required fields
        if (!email || !fname || !mname || !lname || !education || !password || !yearLevel || !schoolYear || !birthdate || !address || !mobile || !sex || !registrationDate || !lrn || !nationality || !birthplace || !religion || !father || !mother || !guardian || !guardianOccupation || !course || !strand ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if(password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Generate student ID
        const currentYear = new Date().getFullYear();
        const lastStudent = await Student.findOne({ _studentId: new RegExp(`^${currentYear}-`) })
            .sort({ _studentId: -1 });

        let nextNumber = "0001";
        if (lastStudent) {
            const lastNumber = parseInt(lastStudent._studentId.split("-")[1], 10);
            nextNumber = String(lastNumber + 1).padStart(4, "0");
        } 


        const newStudentNumber = `${currentYear}-${nextNumber}`;

        // Create new student
        const newStudent = await Student.create({
            _studentId: newStudentNumber,
            studentNumber: newStudentNumber,
            fname,
            mname,
            lname,
            address,
            mobile,
            landline,
            facebook,
            birthdate,
            nationality,
            birthplace,
            religion,
            sex,
            father,
            mother,
            guardian,
            guardianOccupation,
            registrationDate,
            lrn,
            education,
            strand,
            course,
            yearLevel,
            schoolYear,
            email,
            password: hashedPassword
        });



            // Generate JWT Token
        const token = jwt.sign(
          { id: newStudent._id, email: newStudent.email, role: "student" }, 
          process.env.JWT_SECRET, 
          { expiresIn: "7d" } // Token expires in 7 days
        );

        

        return res.status(201).json({ 
          message: "Student added successfully", 
          student: newStudent, 
          token 
      });

    } catch (error) {
        return res.status(500).json({ error: "Failed to add student", details: error.message });
    }
}

  if (method === "PUT") {
    const { _studentId, fname, mname, lname, address, mobile, landline, facebook, birthdate, 
      nationality, birthplace, religion, sex, father, mother, guardian, 
      guardianOccupation, registrationDate, lrn, education, strand, course, 
      yearLevel, schoolYear, email, password } = req.body;
      await Student.updateOne({ _studentId }, { fname, mname, lname, address, mobile, landline, facebook, birthdate, 
        nationality, birthplace, religion, sex, father, mother, guardian, 
        guardianOccupation, registrationDate, lrn, education, strand, course, 
        yearLevel, schoolYear, email, password });
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      const deletedStudent = await Student.findOneAndDelete({
        $or: [{ _studentId: req.query.id }, { _id: req.query.id }],
      });
      if (!deletedStudent) return res.status(404).json({ error: "Student not found" });
      return res.status(200).json(deletedStudent);
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

export default (handler);
