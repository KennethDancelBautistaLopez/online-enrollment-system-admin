import Section from '@/models/Section';
import { connectToDB } from '@/lib/mongoose';

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
          subjects = [],
        } = req.body;

        if (!sectionID || !course || !yearLevel || !semester || !schoolYear || !Array.isArray(subjects)) {
          return res.status(400).json({ success: false, message: 'Missing or invalid required fields.' });
        }

        const formattedSubjects = subjects.map((subject) => ({
          description: subject.description,
          code: subject.code,
          professor: subject.professor || 'TBA',
          schedule: {
            monday: subject.schedule?.monday ?? null,
            tuesday: subject.schedule?.tuesday ?? null,
            wednesday: subject.schedule?.wednesday ?? null,
            thursday: subject.schedule?.thursday ?? null,
            friday: subject.schedule?.friday ?? null,
            saturday: subject.schedule?.saturday ?? null,
            sunday: subject.schedule?.sunday ?? null,
          },
        }));

        const section = await Section.create({
          sectionID,
          course,
          yearLevel,
          semester,
          schoolYear,
          subjects: formattedSubjects,
          students,
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
