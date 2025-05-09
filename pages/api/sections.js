import Section from '@/models/Section';
import { connectToDB } from '@/lib/mongoose';
import Curriculum from '@/models/Subject';

export default async function handler(req, res) {
  await connectToDB();
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const sections = await Section.find({}).populate('students');
        return res.status(200).json({ success: true, data: sections });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      case 'POST':
        try {
          const {
            sectionID,
            course,
            yearLevel,
            semester,
            schoolYear,
            students = [],
            subjectOverrides = [], // Optional overrides for professor/schedule
          } = req.body;
      
          if (!sectionID || !course || !yearLevel || !semester || !schoolYear) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
          }
      
          // Fetch curriculum subjects
          const curriculum = await Curriculum.findOne({
            course,
            yearLevel: String(yearLevel),
            semester,
          });
      
          if (!curriculum) {
            return res.status(404).json({ success: false, message: 'Curriculum not found for the specified course/year/semester.' });
          }
      
          // Map curriculum subjects with overrides for professor/schedule
          const formattedSubjects = curriculum.subjects.map((subject) => {
            const override = subjectOverrides.find(o => o.code === subject.code);
            return {
              code: subject.code,
              description: subject.description,
              units: subject.units,
              professor: override?.professor || 'TBA',
              schedule: {
                monday: override?.schedule?.monday || null,
                tuesday: override?.schedule?.tuesday || null,
                wednesday: override?.schedule?.wednesday || null,
                thursday: override?.schedule?.thursday || null,
                friday: override?.schedule?.friday || null,
                saturday: override?.schedule?.saturday || null,
                sunday: override?.schedule?.sunday || null,
              },
            };
          });
      
          const section = await Section.create({
            sectionID,
            course,
            yearLevel,
            semester,
            schoolYear,
            students,
            subjects: formattedSubjects,
          });
      
          return res.status(201).json({ success: true, data: section });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ success: false, message: error.message });
        }

      case 'PUT':
        try {
          const { id, updates } = req.body;
          const updatedSection = await Section.findByIdAndUpdate(id, updates, { new: true }).populate("students");
          if (!updatedSection) return res.status(404).json({ success: false, message: 'Section not found.' });
          return res.status(200).json({ success: true, data: updatedSection });
        } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
        }

        case 'DELETE':
          try {
            const { id } = req.query;
            if (!id) {
              return res.status(400).json({ success: false, message: 'Section ID is required in query.' });
            }
            const deleted = await Section.findByIdAndDelete(id);
            if (!deleted) {
              return res.status(404).json({ success: false, message: 'Section not found.' });
            }
            return res.status(200).json({ success: true, message: 'Section deleted.' });
          } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
          }


    default:
      res.setHeader('Allow', ['GET','POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
