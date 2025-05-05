// pages/api/subjects.js
import { connectToDB } from '@/lib/mongoose';
import Student from '@/models/Student';

export default async function handler(req, res) {
  await connectToDB();

  const { method } = req;

  if (method === 'GET') {
    const { studentId } = req.query;

    try {
      // Use findOne and query by _studentId
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      return res.status(200).json(student.subjectsBySemester || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'POST') {
    const { studentId, semesterKey, subject } = req.body;

    try {
      // Use findOne and query by _studentId
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      if (!student.subjectsBySemester) {
        student.subjectsBySemester = new Map();
      }
      
      const subjects = student.subjectsBySemester.get(semesterKey) || [];
      subjects.push(subject);
      
      // ✅ Use .set() instead of bracket notation
      student.subjectsBySemester.set(semesterKey, subjects);
      
      await student.save();
      return res.status(200).json({ message: 'Subject added successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'PUT') {
    const { studentId, semesterKey, subjectCode, updatedSubject } = req.body;
  
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: 'Student not found' });
  
      if (!student.subjectsBySemester || !student.subjectsBySemester.has(semesterKey)) {
        return res.status(404).json({ error: 'Semester not found' });
      }
  
      const subjects = student.subjectsBySemester.get(semesterKey);
      const index = subjects.findIndex((subj) => subj.subjectCode === subjectCode);
  
      if (index === -1) {
        return res.status(404).json({ error: 'Subject not found' });
      }
  
      subjects[index] = updatedSubject;
      student.subjectsBySemester.set(semesterKey, subjects);
  
      await student.save();
      return res.status(200).json({ message: 'Subject updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { studentId, semesterKey, subjectCode } = req.body;
  
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: 'Student not found' });
  
      const subjects = student.subjectsBySemester.get(semesterKey) || [];
  
      // Filter out the subject with the matching subjectCode
      const updatedSubjects = subjects.filter(
        (subj) => subj.subjectCode !== subjectCode
      );
  
      // Update the map with the new list
      student.subjectsBySemester.set(semesterKey, updatedSubjects);
  
      await student.save();
  
      return res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
