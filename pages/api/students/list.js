// File: /pages/api/students/list.js

import Student from '@/models/Student';
import { connectToDB } from '@/lib/mongoose';

export default async function handler(req, res) {
  await connectToDB();
  const { method } = req;

  if (method === 'GET') {
    try {
      const students = await Student.find({}, '_id _studentId fname mname lname');
      return res.status(200).json({ success: true, data: students });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
