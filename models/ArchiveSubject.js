// models/Subject.js
import mongoose from "mongoose";
import { auditLoggerPlugin } from "./plugins/AuditLogger.plugin";

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  description: { type: String, required: true },
  units: { type: Number, required: true },
});

const ArchiveCurriculumSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    yearLevel: { type: String, required: true },
    semester: { type: String, required: true },
    subjects: [subjectSchema],
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String },
  },
  {
    timestamps: true,
    collection: "archive-curriculum",
  }
);

ArchiveCurriculumSchema.plugin(auditLoggerPlugin);

export default mongoose.models.ArchiveCurriculum ||
  mongoose.model("ArchiveCurriculum", ArchiveCurriculumSchema);
