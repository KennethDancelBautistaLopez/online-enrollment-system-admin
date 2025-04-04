// /pages/api/upload.js
import fs from 'fs';
import path from 'path';
import { Student } from '@/models/Student'; // Assuming you have a Student model
import multer from 'multer';

// Configure multer to handle file uploads
const upload = multer({
  dest: 'public/uploads/', // Destination folder
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
}).single('file');

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

// Handle file upload
export default async function handler(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { studentId } = req.body;

    // Ensure studentId is provided
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Find the student by studentId
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Save file metadata in student record (update the student record with the file details)
      const filePath = path.join('/uploads', req.file.filename); // Save the relative file path

      student.files.push({
        fileName: req.file.originalname,
        filePath,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      await student.save();

      // Send a response indicating success
      return res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error saving file to database' });
    }
  });
}
