const fs = require("fs");
const path = require("path");

// fileUrl looks like "/uploads/xxx.jpg" (as stored in the DB)
const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;
  const filePath = path.join(__dirname, "..", "..", fileUrl);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete file:", filePath, err.message);
    }
  });
};

module.exports = deleteUploadedFile;