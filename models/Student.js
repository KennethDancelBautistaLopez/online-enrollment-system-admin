import Password from "antd/es/input/Password";
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    _studentId: { type: String, unique: true, required: 	true },
    fname: { type: String, required: true },
    mname: { type: String },
    lname: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    landline: { type: String },
    facebook: { type: String },
    birthdate: { type: Date, required: true },
    birthplace: { type: String, required: true },
    nationality: { type: String, required: true },
    religion: { type: String },
    sex: { type: String, enum: ["Male", "Female", "Other"], 	required: true },
    father: { type: String },
    mother: { type: String },
    guardian: { type: String },
    guardianOccupation: { type: String },
    registrationDate: { type: Date, default: Date.now },
    lrn: { type: String, unique: true },
    
    education: { type: String },
    strand: { type: String },
    course: { type: String },
    yearLevel: { type: String, required: true },
    schoolYear: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["enrolled", "graduated", "dropped", "missing files"], default: "missing files"  },
    role: { type: String, default: "student" },
    files: [{ // Array of file objects
      filename: { type: String, required: true },
      filePath: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true }
    }]
  },

  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export default Student;
