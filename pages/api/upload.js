import nextConnect from 'next-connect'; // Correct import syntax
import multer from "multer";
import fs from "fs";
import path from "path";
import Student from "@/models/Student"; // Import Student model

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("File upload error:", error);
    res.status(500).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  console.log('File upload request received');
  const file = req.file;
  const studentId = req.body.studentId;

  if (!file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/${file.filename}`;
  console.log('File path:', filePath);

  try {
    console.log('Updating student record in the database');
    const student = await Student.findOneAndUpdate(
      { _studentId: studentId },
      {
        $push: {
          files: {
            filename: file.originalname,
            filePath: filePath,
            mimeType: file.mimetype,
            size: file.size,
          },
        },
      },
      { new: true }
    );

    if (!student) {
      console.error('Student not found');
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log('Student updated successfully');
    res.status(200).json({ filePath });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update student record with file' });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
