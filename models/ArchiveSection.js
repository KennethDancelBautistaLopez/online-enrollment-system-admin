import mongoose from "mongoose";
import { auditLoggerPlugin } from "./plugins/AuditLogger.plugin";

const SubjectScheduleSchema = new mongoose.Schema(
  {
    monday: { type: String },
    tuesday: { type: String },
    wednesday: { type: String },
    thursday: { type: String },
    friday: { type: String },
    saturday: { type: String },
    sunday: { type: String },
  },
  { _id: false }
);

const SubjectSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    code: { type: String, required: true },
    schedule: { type: SubjectScheduleSchema },
    professor: { type: String, required: true },
  },
  { _id: false }
);

const ArchiveSectionSchema = new mongoose.Schema(
  {
    sectionID: { type: String, required: true },
    course: { type: String, required: true },
    yearLevel: { type: Number, required: true },
    semester: { type: String, required: true },
    schoolYear: { type: String, required: true },
    subjects: [SubjectSchema],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String },
  },
  {
    timestamps: true,
    collection: "archive-sections",
  }
);

ArchiveSectionSchema.plugin(auditLoggerPlugin);

export default mongoose.models.ArchiveSection ||
  mongoose.model("ArchiveSection", ArchiveSectionSchema);
