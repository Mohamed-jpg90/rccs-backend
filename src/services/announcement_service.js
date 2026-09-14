const Announcement = require("../models/announcement_model");

const createAnnouncement = async (data, creatorId) => {
  return Announcement.create({
    title: data.title,
    description: data.description,
    priority: data.priority,
    expirationDate: data.expirationDate,
    createdBy: creatorId,
  });
};

const getAnnouncements = async () => {
  return Announcement.find().populate("createdBy", "fullName").sort({ createdAt: -1 });
};

const updateAnnouncement = async (id, updates) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    const error = new Error("Announcement not found");
    error.status = 404;
    throw error;
  }

  const fields = ["title", "description", "priority", "expirationDate"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) announcement[field] = updates[field];
  });

  await announcement.save();
  return announcement;
};

const deleteAnnouncement = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    const error = new Error("Announcement not found");
    error.status = 404;
    throw error;
  }
  return announcement;
};

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };
