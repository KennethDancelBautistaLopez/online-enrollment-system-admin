// pages/api/subjects.js
import { connectToDB } from '@/lib/mongoose';
import Student from '@/models/Student';

export default async function handler(req, res) {
  await connectToDB();
  const method = req.method;
  const studentId = req.query.id;

  if (method === 'GET') {
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student data:', error);
      return res.status(500).json({ error: 'Failed to fetch subjects' });
    }

  } else if (method === 'POST') {
    const { code, description } = req.body;
    if (!code || !description ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await Student.findByIdAndUpdate(
        student._id,
        { $pull: { subjects: { code } } }
      );

      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        { $push: { subjects: req.body } },
        { new: true }
      );

      return res.status(200).json(updatedStudent);
    } catch (error) {
      console.error('Error adding subject:', error);
      return res.status(500).json({ error: 'Failed to add subject' });
    }

  } else if (method === 'DELETE') {
    const { code } = req.query;
    if (!studentId || !code) {
      return res.status(400).json({ error: 'Missing studentId or subjectCode' });
    }
  
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: 'Student not found' });
  
      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        { $pull: { subjects: { code: code } } },
        { new: true }
      );
  
      if (!updatedStudent) {
        return res.status(404).json({ error: 'Subject not found in student record' });
      }
  
      return res.status(200).json(updatedStudent);
    } catch (error) {
      console.error('Error deleting subject:', error);
      return res.status(500).json({ error: 'Failed to delete subject' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}