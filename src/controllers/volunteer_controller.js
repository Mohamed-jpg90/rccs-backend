const asyncHandler = require("../utils/async_handler");
const volunteerService = require("../services/volunteer_service");

const createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.createVolunteer(req.body, req.file, req.user._id);
  res.status(201).json({ volunteer });
});

const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.getVolunteers();
  res.json({ total: volunteers.length, volunteers });
});

const getVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getVolunteerById(req.params.id);
  res.json({ volunteer });
});

const updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.updateVolunteer(req.params.id, req.body, req.file);
  res.json({ volunteer });
});

const deleteVolunteer = asyncHandler(async (req, res) => {
  await volunteerService.deleteVolunteer(req.params.id);
  res.json({ message: "Volunteer deleted successfully" });
});

module.exports = { createVolunteer, getVolunteers, getVolunteer, updateVolunteer, deleteVolunteer };