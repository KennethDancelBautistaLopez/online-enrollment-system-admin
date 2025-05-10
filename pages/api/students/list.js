import Student from '@/models/Student';
import { connectToDB } from '@/lib/mongoose';

export default async function handler(req, res) {
  await connectToDB();
  const { method, query } = req;

  if (method === 'GET') {
    try {
      const { course, yearLevel, semester } = query;
      const filters = {};
      if (course) filters.course = course;
      if (yearLevel) filters.yearLevel = yearLevel;
      if (semester) filters.semester = semester;

      const students = await Student.find(filters, '_id _studentId fname mname lname');
      return res.status(200).json({ success: true, data: students });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}