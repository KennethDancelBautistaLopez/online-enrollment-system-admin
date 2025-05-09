// models/Student.js
import mongoose from "mongoose";

const educationHistorySchema = new mongoose.Schema({
  schoolName: { type: String, default: "" },
  yearAttended: { type: String, default: "" },
});

const enrolledSubjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  description: { type: String, required: true },
  units: { type: Number, required: true },
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  _studentId: { type: String, unique: true, required: true },
  fname: { type: String, required: true },
  mname: { type: String },
  lname: { type: String, required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true },
  landline: { type: String },
  facebook: { type: String },
  birthdate: { type: Date, },
  birthplace: { type: String, required: true },
  nationality: { type: String, required: true },
  religion: { type: String },
  sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
  father: { type: String },
  mother: { type: String },
  guardian: { type: String },
  guardianOccupation: { type: String },
  registrationDate: { type: Date, default: Date.now },
  lrn: { type: String, },
  education: { type: String, required: true },
  course: { type: String, required: true },
  yearLevel: { type: Number, required: true },
  semester: { type: String, required: true },
  schoolYear: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  nursery: { type: educationHistorySchema, default: () => ({}) },
  elementary: { type: educationHistorySchema, default: () => ({}) },
  juniorHigh: { type: educationHistorySchema, default: () => ({}) },
  seniorHigh: { type: educationHistorySchema, default: () => ({}) },

  status: {
    type: String,
    enum: ["enrolled", "graduated", "dropped", "missing files"],
    default: "missing files",
  },

  files: [{
    filename: { type: String, required: true, index: true },
    filePath: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    base64: { type: String },
  }],

  tuitionFee: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  }],

  subjects: { type: [enrolledSubjectSchema], default: [] },

}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
