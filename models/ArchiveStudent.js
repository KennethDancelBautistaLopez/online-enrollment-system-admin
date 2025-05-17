import mongoose from "mongoose";
import Email from "next-auth/providers/email";
import { auditLoggerPlugin } from "./plugins/AuditLogger.plugin";

const educationHistorySchema = new mongoose.Schema({
  schoolName: { type: String, default: "" },
  yearAttended: { type: String, default: "" },
});

const enrolledSubjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    description: { type: String, required: true },
    units: { type: Number, required: true },
  },
  { _id: false }
);

const ArchiveStudentSchema = new mongoose.Schema(
  {
    DeletedBy: { type: String },
    originalId: { type: String },
    _studentId: String,
    fname: String,
    mname: String,
    lname: String,
    address: String,
    mobile: String,
    landline: String,
    facebook: String,
    birthdate: Date,
    birthplace: String,
    nationality: String,
    religion: String,
    sex: String,
    father: String,
    mother: String,
    guardian: String,
    guardianOccupation: String,
    registrationDate: Date,
    lrn: String,
    education: String,
    course: String,
    yearLevel: Number,
    semester: String,
    schoolYear: String,
    email: String,
    password: String,
    nursery: educationHistorySchema,
    elementary: educationHistorySchema,
    juniorHigh: educationHistorySchema,
    seniorHigh: educationHistorySchema,
    status: String,
    studentType: String,
    files: [
      {
        filename: String,
        filePath: String,
        mimeType: String,
        size: Number,
        base64: String,
      },
    ],
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    subjects: [enrolledSubjectSchema],
    verified: Boolean,
    section: String,
    deletedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "archive-students",
  }
);

ArchiveStudentSchema.plugin(auditLoggerPlugin);

export default mongoose.models.ArchiveStudent ||
  mongoose.model("ArchiveStudent", ArchiveStudentSchema);
