const deleteUploadedFile = require("./delete_uploaded_file");
const { prepareImage, uploadPrepared, deleteImage, publicIdFromUrl } = require("./image_upload");

const removeExistingImage = async ({ url, publicId }) => {
  if (!url && !publicId) return;
  if (url && url.startsWith("/uploads/")) {
    await deleteUploadedFile(url);
    return;
  }
  const id = publicId || publicIdFromUrl(url);
  if (!id) return;
  const result = await deleteImage(id);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary could not delete asset: ${id}`);
  }
};

const  removeExistingImageBestEffort = async (image, label) => {
  try {
    await removeExistingImage(image);
  } catch (error) {
    console.error(`Failed to delete ${label} image:`, error.message);
  }
};

const replaceDocumentImage = async (document, { imageField, publicIdField, folder, label }, file) => {
  // 1) Compress FIRST. A corrupt file fails here, and the old image is untouched.
  let prepared;
  try {
    prepared = await prepareImage(file);
  } catch (cause) {
    console.error(`Could not process new ${label} image:`, cause.message);
    const error = new Error(`The ${label} image could not be processed. Please upload a valid image`);
    error.status = 400;
    throw error;
  }

  // 2) Delete the old image
  try {
    await removeExistingImage({ url: document[imageField], publicId: document[publicIdField] });
  } catch (cause) {
    console.error(`Failed to delete old ${label} image before replacement:`, cause.message);
    const error = new Error(`Could not replace ${label} image because the old image could not be deleted`);
    error.status = 502;
    throw error;
  }

  // 3) Upload the new one
  try {
    const uploaded = await uploadPrepared(prepared, folder);
    document[imageField] = uploaded.url;
    document[publicIdField] = uploaded.publicId;
  } catch (cause) {
    document[imageField] = null;
    document[publicIdField] = null;
    await document.save();
    console.error(`Failed to upload new ${label} image after deleting the old one:`, cause.message);
    const error = new Error(`Could not upload the new ${label} image`);
    error.status = 502;
    throw error;
  }
};

module.exports = { removeExistingImage, removeExistingImageBestEffort, replaceDocumentImage };
