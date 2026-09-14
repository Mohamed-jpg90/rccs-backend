const asyncHandler = require("../utils/async_handler");
const announcementService = require("../services/announcement_service");

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(req.body, req.user._id);
  res.status(201).json({ announcement });
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAnnouncements();
  res.json({ total: announcements.length, announcements });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
  res.json({ announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id);
  res.json({ message: "Announcement deleted successfully" });
});

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };
