// pages/api/curriculum-subjects.js
import { connectToDB } from '@/lib/mongoose';
import Curriculum from '@/models/Subject'; // your curriculum model

export default async function handler(req, res) {
  await connectToDB();

  // Expect query params like ?course=BSCS&yearLevel=1&semester=1st Semester
  const { course, yearLevel, semester } = req.query;

  if (!course || !yearLevel || !semester) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  try {
    const curriculum = await Curriculum.findOne({
      course,
      yearLevel,
      semester,
    }).lean();

    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }

    // Return the subjects array only
    return res.status(200).json(curriculum.subjects);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
