  import {connectToDB}  from "@/lib/mongoose";
  import Student from "@/models/Student";
  import jwt from "jsonwebtoken";
  import mongoose from "mongoose";
  import {hash} from "bcryptjs";


  async function handler(req, res) {
    console.log("API /students called with method:", req.method);
    await connectToDB();
    const {method} = req;

    if (method === "GET") {
      try {
        const { id } = req.query;
        console.log("Received ID:", id); // Debugging log
  
        if (id) {
          // ✅ Validate ObjectId properly
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid student ID format" });
          }
  
          // ✅ Find by either MongoDB `_id` or `_studentId`
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
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
      }
    }

    if (req.method === "POST") {
      try {
        const { 
          fname, mname, lname, address, mobile, landline, facebook, birthdate, 
          birthplace, nationality, religion, sex, father, mother, guardian, 
          guardianOccupation, registrationDate, lrn, education, course, 
          yearLevel, schoolYear, email, password, semester, nursery, elementary, 
          juniorHigh, seniorHigh
        } = req.body;

        const { yearAttended: nurseryYear, schoolName: nurserySchool } = nursery;
        const { yearAttended: elementaryYear, schoolName: elementarySchool } = elementary;
        const { yearAttended: juniorHighYear, schoolName: juniorHighSchool } = juniorHigh;
        const { yearAttended: seniorHighYear, schoolName: seniorHighSchool } = seniorHigh;
    
        // Validation (Ensure all required fields are provided)
        if (!fname || !lname || !address || !mobile || !facebook || !birthdate || !birthplace || !nationality || !religion || !sex || !father || !mother || !guardian || !guardianOccupation || !registrationDate || !education || !yearLevel || !schoolYear || !email || !password || !semester) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const mobileRegex = /^\d{4}-\d{3}-\d{4}$/;
        if (!mobileRegex.test(mobile)) {
          return res.status(400).json({ error: "Invalid mobile number format. Use XXXX-XXX-XXXX." });
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
    
        // Check for existing student email
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
          return res.status(400).json({ error: "Email already exists" });
        }
    
        // Hash password before saving it
        const hashedPassword = await hash(password, 12);
    
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
    
        // Create new student in the database
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
          nursery: {
            schoolName: nurserySchool,  // Now using the destructured variable
            yearAttended: nurseryYear   // Now using the destructured variable
          },
          elementary: {
            schoolName: elementarySchool, // Now using the destructured variable
            yearAttended: elementaryYear  // Now using the destructured variable
          },
          juniorHigh: {
            schoolName: juniorHighSchool, // Now using the destructured variable
            yearAttended: juniorHighYear  // Now using the destructured variable
          },
          seniorHigh: {
            schoolName: seniorHighSchool, // Now using the destructured variable
            yearAttended: seniorHighYear  // Now using the destructured variable
          },
          semester,
     
        });
    
        // Generate JWT Token
        const token = jwt.sign(
          { id: newStudent._id, email: newStudent.email, role: "student", studentId: newStudent._studentId, studentNumber: newStudent.studentNumber },
          process.env.JWT_SECRET,
          { expiresIn: "7d" } // Token expires in 7 days
        );
    
        return res.status(201).json({ 
          message: "Student added successfully", 
          student: {
            _studentId: newStudent._studentId,
            studentNumber: newStudent.studentNumber,
            fname: newStudent.fname,
            mname: newStudent.mname,
            lname: newStudent.lname,
            email: newStudent.email,
          },
          token, // Returning the token to the client
        });
    
      } catch (error) {
        return res.status(500).json({ error: "Failed to add student", details: error.message });
      }
    }
    

    if (method === "PUT") {
      try {
        const { id } = req.query;
        const updatedData = req.body;
    
        if (!id) return res.status(400).json({ error: "Student ID is required" });

        if (updatedData.password) {
          const salt = await bcrypt.genSalt(10);
          updatedData.password = await bcrypt.hash(updatedData.password, salt);
        }
    
        const updatedStudent = await Student.findOneAndUpdate(
          { _studentId: id },
          updatedData,
          { new: true, runValidators: true }
        );
    
        if (!updatedStudent) {
          return res.status(404).json({ error: "Student not found" });
        }
    
        return res.status(200).json(updatedStudent);
      } catch (error) {
        console.error("Error updating student:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
      }
    }
  
// if (method === "DELETE") {
//   if (req.query?.id) {
//     const studentId = req.query.id;

//     // Find and delete the student
//     const deletedStudent = await Student.findOneAndDelete({
//       $or: [{ _studentId: studentId }, { _id: studentId }],
//     });

//     if (!deletedStudent) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // // If student is deleted, also delete the associated payments
//     // const deletedPayments = await Payment.deleteMany({
//     //   studentRef: deletedStudent._id, // Use studentRef to find payments linked to the deleted student
//     // });

//     // console.log(`Deleted ${deletedPayments.deletedCount} payments for student ${studentId}`);

//     return res.status(200).json({
//       message: "Student and associated payments deleted successfully",
//       deletedStudent,
//     });
//   } else {
//     return res.status(400).json({ error: "Student ID is required" });
//   }
// }

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
