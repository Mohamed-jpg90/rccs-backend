const Volunteer = require("../models/volunteer_model");
const User = require("../models/user_model");
const { uploadImage } = require("../utils/image_upload");
const { replaceDocumentImage, removeExistingImageBestEffort } = require("../utils/image_lifecycle");
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

  const image = await uploadImage(uploadedFile, "rccs/volunteers");
  return Volunteer.create({
    name: data.name,
    email: data.email,
    description: data.description,
    image: image.url,
    imagePublicId: image.publicId,
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
    await replaceDocumentImage(volunteer, { imageField: "image", publicIdField: "imagePublicId", folder: "rccs/volunteers", label: "volunteer" }, uploadedFile);
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

  await removeExistingImageBestEffort({ publicId: volunteer.imagePublicId, url: volunteer.image }, "volunteer");
  await volunteer.deleteOne();

  return volunteer;
};

module.exports = { createVolunteer, getVolunteers, getVolunteerById, updateVolunteer, deleteVolunteer };
