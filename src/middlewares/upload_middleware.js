const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const maxSizeMB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;
const fileFilter = (req, file, cb) => {
  allowedMimeTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only image (jpeg/png/webp/gif) or PDF files are allowed"), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: maxSizeMB * 1024 * 1024 } });
