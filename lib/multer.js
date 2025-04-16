import multer from 'multer';

// Configure multer to store files in memory (for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),  // Store file in memory buffer
  limits: { fileSize: 10 * 1024 * 1024 },  // Max file size of 10MB
  fileFilter(req, file, cb) {
    // Allow only PDF or JPEG files
    if (file.mimetype !== 'application/pdf' && file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only JPEG and PDF are allowed'), false);
    }
    cb(null, true);
  },
});

export { upload };