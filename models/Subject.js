import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  description: { type: String, required: true },
  units: { type: Number, required: true }
});

const curriculumSchema = new mongoose.Schema({
  course: { type: String, required: true },
  yearLevel: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [subjectSchema]
});

export default mongoose.models.Curriculum || mongoose.model('Curriculum', curriculumSchema);