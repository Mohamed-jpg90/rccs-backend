const asyncHandler = require("../utils/async_handler");
const sponsorService = require("../services/sponsor_service");

const createSponsor = asyncHandler(async (req, res) => {
  const sponsor = await sponsorService.createSponsor(req.body, req.file, req.user._id);
  res.status(201).json({ sponsor });
});

// GET /api/sponsors/images — id + image only, paginated (infinite-scroll bar)
const getSponsorImages = asyncHandler(async (req, res) => {
  const result = await sponsorService.getSponsorImages(req.query);
  res.json(result);
});

const getSponsors = asyncHandler(async (req, res) => {
  const sponsors = await sponsorService.getSponsors();
  res.json({ total: sponsors.length, sponsors });
});

// GET /api/sponsors/:id — full info for the details page
const getSponsor = asyncHandler(async (req, res) => {
  const sponsor = await sponsorService.getSponsorById(req.params.id);
  res.json({ sponsor });
});

const updateSponsor = asyncHandler(async (req, res) => {
  const sponsor = await sponsorService.updateSponsor(req.params.id, req.body, req.file);
  res.json({ sponsor });
});

const deleteSponsor = asyncHandler(async (req, res) => {
  await sponsorService.deleteSponsor(req.params.id);
  res.json({ message: "Sponsor deleted successfully" });
});

module.exports = { createSponsor, getSponsorImages, getSponsors, getSponsor, updateSponsor, deleteSponsor };