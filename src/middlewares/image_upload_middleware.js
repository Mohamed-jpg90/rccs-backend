const multer = require("multer");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxSizeMB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;

const fileFilter = (req, file, cb) => {
  allowedMimeTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only image (jpeg/png/webp/gif) files are allowed"), false);
};

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
});
