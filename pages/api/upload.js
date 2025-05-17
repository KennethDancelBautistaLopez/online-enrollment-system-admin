import Student from "@/models/Student";
import { connectToDB } from "@/lib/mongoose";
import multer from "multer";
import nc from "next-connect";

// Multer setup to handle multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// Middleware handler
const handler = nc({
  onError(error, req, res) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: "Method not allowed" });
  },
});

// Connect to MongoDB before handling requests
handler.use(async (req, res, next) => {
  await connectToDB();
  next();
});

// POST: Upload file
handler.post(upload.single("file"), async (req, res) => {
  const file = req.file;
  const studentId = req.body.studentId;

  if (!file || !studentId) {
    return res.status(400).json({ error: "Missing file or studentId" });
  }

  const base64String = file.buffer.toString("base64");

  try {
    const student = await Student.findOneAndUpdate(
      { _studentId: studentId },
      {
        $push: {
          files: {
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            base64: base64String,
          },
        },
      },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

handler.delete(async (req, res) => {
  const { studentId, index } = req.query;

  if (!studentId || index === undefined) {
    return res.status(400).json({ error: "Missing studentId or index" });
  }

  try {
    const student = await Student.findOne({ _studentId: studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const fileIndex = parseInt(index);
    if (
      isNaN(fileIndex) ||
      fileIndex < 0 ||
      fileIndex >= student.files.length
    ) {
      return res.status(404).json({ error: "File not found" });
    }

    // Remove the file
    student.files.splice(fileIndex, 1);
    await student.save();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Download a file by index
handler.get(async (req, res) => {
  const { studentId, index, inline } = req.query;

  if (index !== undefined) {
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const file = student.files[parseInt(index)];
      if (!file) return res.status(404).json({ error: "File not found" });

      const buffer = Buffer.from(file.base64, "base64");

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Length", buffer.length);

      if (!inline || inline === "false") {
        // Force download only when inline=false or not present
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${file.filename}"`
        );
      }

      res.send(buffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to fetch file" });
    }
  } else {
    // Return metadata
    try {
      const student = await Student.findOne({ _studentId: studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const files = student.files.map(
        ({ filename, mimeType, size }, index) => ({
          index,
          filename,
          mimeType,
          size,
        })
      );

      res.status(200).json({ files });
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  }
});

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

export default handler;
