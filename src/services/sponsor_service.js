const Sponsor = require("../models/sponsor_model");
const deleteCloudinaryAsset = require("../utils/delete_cloudinary_asset");
const parseSocialLinks = require("../utils/parse_social_links");

const createSponsor = async (data, uploadedFile, creatorId) => {
  if (!uploadedFile) {
    const error = new Error("Sponsor image is required");
    error.status = 400;
    throw error;
  }

  return Sponsor.create({
    name: data.name,
    title: data.title,
    description: data.description,
    sector: data.sector,
    image: uploadedFile.path,
    imagePublicId: uploadedFile.filename,
    socialLinks: parseSocialLinks(data.socialLinks),
    createdBy: creatorId,
  });
};


// Lightweight + paginated — for the infinite-scroll bar. Only id/name/image travel.
const getSponsorImages = async ({ page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [sponsors, total] = await Promise.all([
    Sponsor.find().select("name image").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Sponsor.countDocuments(),
  ]);
  return { sponsors, total, page: Number(page), limit: Number(limit) };
};

const getSponsors = async () => {
  return Sponsor.find().populate("createdBy", "fullName").sort({ createdAt: -1 });
};

// Full info — for the details page (title + description)
const getSponsorById = async (id) => {
  const sponsor = await Sponsor.findById(id).populate("createdBy", "fullName");
  if (!sponsor) {
    const error = new Error("Sponsor not found");
    error.status = 404;
    throw error;
  }
  return sponsor;
};

const updateSponsor = async (id, updates, uploadedFile) => {
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    const error = new Error("Sponsor not found");
    error.status = 404;
    throw error;
  }

  const fields = ["name", "title", "description", "sector"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) sponsor[field] = updates[field];
  });

  if (updates.socialLinks !== undefined) {
    sponsor.socialLinks = parseSocialLinks(updates.socialLinks);
  }

  if (uploadedFile) {
    const oldImage = sponsor.image;
    const oldImagePublicId = sponsor.imagePublicId;
    sponsor.image = uploadedFile.path;
    sponsor.imagePublicId = uploadedFile.filename;
    await sponsor.save();
    await deleteCloudinaryAsset({ publicId: oldImagePublicId, url: oldImage });
    return sponsor;
  }

  await sponsor.save();
  return sponsor;
};

const deleteSponsor = async (id) => {
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    const error = new Error("Sponsor not found");
    error.status = 404;
    throw error;
  }

  await deleteCloudinaryAsset({ publicId: sponsor.imagePublicId, url: sponsor.image });
  await sponsor.deleteOne();

  return sponsor;
};

module.exports = { createSponsor, getSponsorImages, getSponsors, getSponsorById, updateSponsor, deleteSponsor };
