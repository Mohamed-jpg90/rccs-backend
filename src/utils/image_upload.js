const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    resolve(result);
  });
  stream.end(buffer);
});

const prepareImage = async (file) => {
  if (!file || !file.buffer) throw new Error("An image file is required");

  // Animated GIFs are uploaded unchanged so the animation isn't broken.
  if (file.mimetype === "image/gif") return { buffer: file.buffer, options: {} };

  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return { buffer, options: { format: "webp" } };
};

// const uploadImage = async (file, folder) => {
//   if (!file || !file.buffer) throw new Error("An image file is required");

//   // Re-encoding animated GIFs with Sharp can flatten or alter their frames.
//   // Upload unchanged to guarantee animations are not broken.
//   if (file.mimetype === "image/gif") {
//     const result = await uploadBuffer(file.buffer, { resource_type: "image", folder });
//     return { url: result.secure_url, publicId: result.public_id };
//   }

//   // WebP preserves alpha, so transparent PNG sponsor logos stay transparent.
//   const webpBuffer = await sharp(file.buffer)
//     .rotate()
//     .resize({ width: 1600, withoutEnlargement: true })
//     .webp({ quality: 80 })
//     .toBuffer();
//   const result = await uploadBuffer(webpBuffer, { resource_type: "image", folder, format: "webp" });
//   return { url: result.secure_url, publicId: result.public_id };
// };
const uploadPrepared = async ({ buffer, options }, folder) => {
  const result = await uploadBuffer(buffer, { resource_type: "image", folder, ...options });
  return { url: result.secure_url, publicId: result.public_id };
};

const uploadImage = async (file, folder) => uploadPrepared(await prepareImage(file), folder);

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId, { invalidate: true });

const publicIdFromUrl = (assetUrl) => {
  if (!assetUrl) return null;
  try {
    const url = new URL(assetUrl);
    if (!url.hostname.endsWith("cloudinary.com")) return null;
    const [, uploadedPath] = url.pathname.split("/upload/");
    if (!uploadedPath) return null;
    return decodeURIComponent(uploadedPath.replace(/^v\d+\//, "")).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

module.exports = { prepareImage, uploadPrepared, uploadImage, deleteImage, publicIdFromUrl };
