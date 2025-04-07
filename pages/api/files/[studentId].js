import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { studentId } = req.query;
  const filePath = path.resolve('public', 'uploads', `${studentId}-download.jpg`); // Change this to match your file structure

  console.log("File path:", filePath); // For debugging

  try {
    if (fs.existsSync(filePath)) {
      const fileExtension = path.extname(filePath).toLowerCase();
      
      // Set the appropriate MIME type based on file extension
      let contentType;
      if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (fileExtension === '.png') {
        contentType = 'image/png';
      } else if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else {
        contentType = 'application/octet-stream'; // Default binary stream
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename=${studentId}-download.jpg`); // For inline viewing
      fs.createReadStream(filePath).pipe(res); // Stream the file to the response
    } else {
      console.error('File not found:', filePath);
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error("File retrieval error:", error);
    res.status(500).json({ error: 'Error retrieving the file' });
  }
}
