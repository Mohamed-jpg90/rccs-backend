const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Older records store only Cloudinary's secure URL. New records also store the
// public ID returned by multer-storage-cloudinary, so both can be cleaned up.
const publicIdFromUrl = (assetUrl) => {
  if (!assetUrl) return null;

  try {
    const url = new URL(assetUrl);
    if (!url.hostname.endsWith("cloudinary.com")) return null;

    const [, uploadedPath] = url.pathname.split("/upload/");
    if (!uploadedPath) return null;

    const pathWithoutVersion = uploadedPath.replace(/^v\d+\//, "");
    return decodeURIComponent(pathWithoutVersion).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const deleteCloudinaryAsset = async ({ publicId, url }) => {
  const id = publicId || publicIdFromUrl(url);
  if (!id) return;

  const result = await cloudinary.uploader.destroy(id, { invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary could not delete asset: ${id}`);
  }
};

module.exports = deleteCloudinaryAsset;
