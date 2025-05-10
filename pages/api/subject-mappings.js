// pages/api/subject-mappings.js
import { connectToDB } from '@/lib/mongoose';
import Curriculum from '@/models/Subject';

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === 'POST') {
    const { code, description, yearLevel, semester, course } = req.body;

    if (!code || !description || !yearLevel || !semester || !course) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    try {
      // 1. Check if the course already has any mapping
      const courseExists = await Curriculum.findOne({ course });
      if (!courseExists) {
        // Course doesn't exist — it's OK to proceed
      } else {
        // 2. Course exists — check if year level already exists
        const yearExists = await Curriculum.findOne({ course, yearLevel });
        if (!yearExists) {
          // Year doesn't exist — it's OK to proceed
        } else {
          // 3. Year exists — check if semester exists for the same course + year
          const semesterExists = await Curriculum.findOne({
            course,
            yearLevel,
            semester,
          });

          if (semesterExists) {
            return res.status(409).json({
              success: false,
              error: `${course} - ${yearLevel}st Year - ${semester} already exists.`,
            });
          }
        }
      }

      // If none of the above conflicts, create the mapping
      const curriculum = await Curriculum.create(req.body);
      res.status(201).json({ success: true, data: curriculum });

    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } 
  else   if (req.method === 'GET') {
    try {
      // Fetch all curriculum entries with their subjects
      const allCurricula = await Curriculum.find();
      res.status(200).json({ success: true, data: allCurricula });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch curricula' });
    }
  } else if (req.method === 'DELETE') {
  const { id } = req.query; 
    console.log(id);
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Curriculum ID is required to delete',
    });
  }

  try {
    const curriculumToDelete = await Curriculum.findByIdAndDelete(id);
    if (!curriculumToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Curriculum not found',
      });
    }

      res.status(200).json({ success: true, message: 'Curriculum deleted successfully' });
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      res.status(500).json({ success: false, error: 'Error deleting curriculum' });
    }
  }
  else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
