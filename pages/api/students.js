  import {connectToDB}  from "@/lib/mongoose";
  import Student from "@/models/Student";
  import jwt from "jsonwebtoken";
  import mongoose from "mongoose";


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

    if (method === "POST") {
      try {

          const { 
              fname, mname, lname, address, mobile, landline, facebook, birthdate, 
              birthplace, nationality, religion, sex, father, mother, guardian, 
              guardianOccupation, registrationDate, lrn, education, strand, course, 
              yearLevel, schoolYear, email, status
          } = req.body;

          console.log("Education value before sending:", education);

          // Validate required fields
          if ( !fname || !lname ||!address || !mobile || !facebook || !birthdate || !birthplace || !nationality || !religion || !sex || !father || !mother || !guardian || !guardianOccupation || !registrationDate || !education || !yearLevel || !schoolYear || !email) {
              return res.status(400).json({ error: "Missing required fields" });
          }

          // fname and lname format
          const nameRegex = /^[A-Za-z\s]{1,50}$/;
          if (!nameRegex.test(fname) || !nameRegex.test(lname)) {
              return res.status(400).json({ error: "Invalid name format. Must be up to 50 characters." });
          }

          // Validate mobile number format
          const mobileRegex = /^\d{4}-\d{3}-\d{4}$/;
          if (!mobileRegex.test(mobile)) {
              return res.status(400).json({ error: "Invalid mobile number format. Use XXXX-XXX-XXXX." });
          }

          // // strand format
          // const strandRegex = /^[A-Z]{3,6}$/;
          // if (!strandRegex.test(strand)) {
          //     return res.status(400).json({ error: "Invalid strand format" });
          // }

          // // Course format
          // const courseRegex = /^[A-Z\s]{1,10}$/;
          // if (course && !courseRegex.test(course)) {
          //   return res.status(400).json({ error: "Invalid course format. Must be all caps and up to 10 letters." });
          // }

          // if education is college, course is required
          if (education === "college" && !course) {
              return res.status(400).json({ error: "Course is required for college education" });
          }
          // if education is senior high, strand is required
          if (education === "senior high" && !strand) {
              return res.status(400).json({ error: "Strand is required for senior high education" });
          }
          // if education is elementary and junior high, the strand and course are not required
          if (education === "elementary" || education === "junior high") {
              if (strand) {
                  return res.status(400).json({ error: "Strand is not required for elementary and junior high education" });
              }
              if (course) {
                  return res.status(400).json({ error: "Course is not required for elementary and junior high education" });
              }
          }


          // lrn format
          const lrnRegex = /^[0-9]{12}$/;
          if (!lrnRegex.test(lrn)) {
              return res.status(400).json({ error: "Invalid LRN format" });
          }

          // year level format 
          const yearLevelRegex = /^(1[0-2]|[1-9])$/;
          if (!yearLevelRegex.test(yearLevel)) {
              return res.status(400).json({ error: "Invalid year level format. Enter a number between 1 and 12." });
          }

          // school year format
          const schoolYearRegex = /^(20\d{2})-(20\d{2})$/;
          if (!schoolYearRegex.test(schoolYear)) {
              return res.status(400).json({ error: "Invalid school year format" });
          }
          


          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ error: "Invalid email format" });
          }

          const facebookRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/([a-zA-Z0-9.]+|share\/[^\s]+)?$/;
          if (!facebookRegex.test(facebook)) {
            return res.status(400).json({ error: "Invalid Facebook URL format" });
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
              strand,
              course,
              yearLevel,
              schoolYear,
              email,
              status: "missing files",
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
    try {
      const { status } = req.body;
      const { id } = req.query;  // Student ID from the URL (query param)
  
      if (!id) return res.status(400).json({ error: "Student ID is required" });
      if (!status) return res.status(400).json({ error: "Status is required" });
  
      // Ensure status is one of the predefined options
      const validStatuses = ["enrolled", "graduated", "dropped", "missing files"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
  
      // Ensure student._studentId is valid (check if it's a string)
      if (!id || typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
  
      // Find the student and update their status
      const updatedStudent = await Student.findOneAndUpdate(
        { _studentId: id },  // Search by student._studentId
        { status },           // Update the status field
        { new: true, runValidators: true }  // Ensure the update is validated
      );
  
      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      return res.status(200).json(updatedStudent);  // Return the updated student
    } catch (error) {
      console.error("Error updating student:", error);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
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
