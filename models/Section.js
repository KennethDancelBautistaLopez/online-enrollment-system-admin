import mongoose from "mongoose";

const SubjectScheduleSchema = new mongoose.Schema({
  monday: { type: String},
  tuesday: { type: String},
  wednesday: { type: String},
  thursday: { type: String},
  friday: { type: String},
  saturday: { type: String },
  sunday: { type: String},
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  description: { type: String, required: true },
  code: { type: String, required: true },
  schedule: { type: SubjectScheduleSchema},
  professor: { type: String, required: true }
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  sectionID: { type: String, required: true },
  course: { type: String, required: true },
  yearLevel: { type: String, required: true },
  semester: { type: String, required: true },
  schoolYear: { type: String, required: true },
  subjects: [SubjectSchema],
  students: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.Section || mongoose.model("Section", SectionSchema);
