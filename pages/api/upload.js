import nextConnect from 'next-connect';
import multer from "multer";
import fs from "fs";
import path from "path";
import Student from "@/models/Student";

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

const upload = multer({ storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("File upload error:", error);
    res.status(500).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// POST: Upload a file
apiRoute.post(upload.single("file"), async (req, res) => {
  const file = req.file;
  const studentId = req.body.studentId;

  if (!file || !studentId) {
    return res.status(400).json({ error: 'Missing file or studentId' });
  }

  const filePath = `/uploads/${file.filename}`;

  try {
    const student = await Student.findOneAndUpdate(
      { _studentId: studentId },
      {
        $push: {
          files: {
            filename: file.originalname,
            filePath,
            mimeType: file.mimetype,
            size: file.size,
          },
        },
      },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json({ message: 'File uploaded', filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to update student record with file' });
  }
});

// GET: Retrieve student files
apiRoute.get(async (req, res) => {
  const { studentId } = req.query;

  try {
    const student = await Student.findOne({ _studentId: studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json({ files: student.files || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

apiRoute.delete(async (req, res) => {
  const { studentId, filePath } = req.query; // ⬅️ Use query, not req.body

  if (!studentId || !filePath) {
    return res.status(400).json({ error: "Missing studentId or filePath" });
  }

  try {
    const student =
      (await Student.findOneAndUpdate(
        { _studentId: studentId },
        { $pull: { files: { filePath } } },
        { new: true }
      )) ||
      (await Student.findOneAndUpdate(
        { _id: studentId },
        { $pull: { files: { filePath } } },
        { new: true }
      ));

    if (!student) {
      console.warn(`Student not found for ID: ${studentId}`);
      return res.status(404).json({ error: "Student not found" });
    }

    const absolutePath = path.join(process.cwd(), "public", filePath);
    await fs.promises.unlink(absolutePath); // Use `fs.promises` directly

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Needed for multer and raw body reading
  },
};
