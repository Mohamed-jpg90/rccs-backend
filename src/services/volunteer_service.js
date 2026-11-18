const Volunteer = require("../models/volunteer_model");
const User = require("../models/user_model");
const deleteCloudinaryAsset = require("../utils/delete_cloudinary_asset");
const parseSocialLinks = require("../utils/parse_social_links");

const createVolunteer = async (data, uploadedFile, creatorId) => {
  if (!uploadedFile) {
    const error = new Error("Volunteer image is required");
    error.status = 400;
    throw error;
  }

  let linkedUser = null;
  if (data.linkedUser) {
    const user = await User.findById(data.linkedUser);
    if (!user) {
      const error = new Error("Linked account not found");
      error.status = 404;
      throw error;
    }
    linkedUser = user._id;
  }

  return Volunteer.create({
    name: data.name,
    email: data.email,
    description: data.description,
    image: uploadedFile.path,
    imagePublicId: uploadedFile.filename,
    socialLinks: parseSocialLinks(data.socialLinks),
    linkedUser,
    createdBy: creatorId,
  });
};

const getVolunteers = async () => {
  return Volunteer.find()
    .populate("linkedUser", "fullName email profileImage")
    .sort({ createdAt: -1 });
};

const getVolunteerById = async (id) => {
  const volunteer = await Volunteer.findById(id).populate("linkedUser", "fullName email profileImage");
  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.status = 404;
    throw error;
  }
  return volunteer;
};

const updateVolunteer = async (id, updates, uploadedFile) => {
  const volunteer = await Volunteer.findById(id);
  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.status = 404;
    throw error;
  }

  const fields = ["name", "email", "description"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) volunteer[field] = updates[field];
  });

  if (updates.socialLinks !== undefined) {
    volunteer.socialLinks = parseSocialLinks(updates.socialLinks);
  }

  if (updates.linkedUser !== undefined) {
    if (updates.linkedUser === "" || updates.linkedUser === null) {
      volunteer.linkedUser = null;
    } else {
      const user = await User.findById(updates.linkedUser);
      if (!user) {
        const error = new Error("Linked account not found");
        error.status = 404;
        throw error;
      }
      volunteer.linkedUser = user._id;
    }
  }

  

  if (uploadedFile) {
    const oldImage = volunteer.image;
    const oldImagePublicId = volunteer.imagePublicId;
    volunteer.image = uploadedFile.path;
    volunteer.imagePublicId = uploadedFile.filename;
    await volunteer.save();
    await deleteCloudinaryAsset({ publicId: oldImagePublicId, url: oldImage });
    return volunteer;
  }

  await volunteer.save();
  return volunteer;
};

const deleteVolunteer = async (id) => {
  const volunteer = await Volunteer.findById(id);
  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.status = 404;
    throw error;
  }

  await deleteCloudinaryAsset({ publicId: volunteer.imagePublicId, url: volunteer.image });
  await volunteer.deleteOne();

  return volunteer;
};

module.exports = { createVolunteer, getVolunteers, getVolunteerById, updateVolunteer, deleteVolunteer };
