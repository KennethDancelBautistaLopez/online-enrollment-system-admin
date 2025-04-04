// /pages/api/files/[studentId].js
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { studentId } = req.query;
  const filePath = path.resolve('public', 'uploads', `${studentId}.pdf`); // Adjust the file extension if necessary

  try {
    if (fs.existsSync(filePath)) {
      // If the file exists, send it to the client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${studentId}.pdf`);
      fs.createReadStream(filePath).pipe(res); // Stream the file to the client
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving the file' });
  }
}
