const fs = require("fs");
const path = require("path");

// fileUrl looks like "/uploads/xxx.jpg" (as stored in the DB)
const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return Promise.resolve();
  const filePath = path.join(__dirname, "..", "..", fileUrl);
  return fs.promises.unlink(filePath).catch((err) => {
    if (err.code !== "ENOENT") console.error("Failed to delete file:", filePath, err.message);
  });
};

module.exports = deleteUploadedFile;
