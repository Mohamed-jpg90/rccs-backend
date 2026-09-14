const asyncHandler = require("../utils/async_handler");
const contentService = require("../services/content_service");

const createContent = asyncHandler(async (req, res) => {
  const content = await contentService.createContent(req.body, req.user);
  res.status(201).json({ content });
});

const getContent = asyncHandler(async (req, res) => {
  const result = await contentService.getContent(req.user, req.query);
  res.json(result);
});

const updateContent = asyncHandler(async (req, res) => {
  const content = await contentService.updateContent(req.params.id, req.body);
  res.json({ content });
});

const deleteContent = asyncHandler(async (req, res) => {
  await contentService.deleteContent(req.params.id);
  res.json({ message: "Content deleted successfully" });
});

module.exports = { createContent, getContent, updateContent, deleteContent };