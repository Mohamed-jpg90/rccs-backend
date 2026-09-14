const asyncHandler = require("../utils/async_handler");
const clubService = require("../services/club_service");

const createClub = asyncHandler(async (req, res) => {
  const club = await clubService.createClub(req.body, req.file);
  res.status(201).json({ club });
});

const getClubs = asyncHandler(async (req, res) => {
  const result = await clubService.getClubs(req.query);
  res.json(result);
});

const getClub = asyncHandler(async (req, res) => {
  const club = await clubService.getClubById(req.params.id);
  if (!club) return res.status(404).json({ message: "Club not found" });
  res.json({ club });
});

const updateClub = asyncHandler(async (req, res) => {
  const club = await clubService.updateClub(req.params.id, req.body, req.file);
  res.json({ club });
});

const deleteClub = asyncHandler(async (req, res) => {
  await clubService.deleteClub(req.params.id);
  res.json({ message: "Club deleted successfully" });
});

const getClubOverview = asyncHandler(async (req, res) => {
  const overview = await clubService.getClubOverview(req.params.id);
  res.json(overview);
});

module.exports = { createClub, getClubs, getClub, updateClub, deleteClub, getClubOverview };
