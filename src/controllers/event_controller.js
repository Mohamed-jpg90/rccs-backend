const asyncHandler = require("../utils/async_handler");
const eventService = require("../services/event_service");
const qrService = require("../services/qr_service");
const feedbackService = require("../services/feedback_service"); 

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id, req.file);
  res.status(201).json({ event });
});

const getEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getEvents(req.query);
  res.json(result);
});


const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const feedback = await feedbackService.getFeedbackForEvent(req.params.id);
  res.json({ event, feedback });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body, req.file);
  res.json({ event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.json({ message: "Event deleted successfully" });
});

const getEventParticipants = asyncHandler(async (req, res) => {
  const participants = await eventService.getEventParticipants(req.params.id);
  res.json({ total: participants.length, participants });
});

// Admin / Team Leader: generate the QR code to display at the event entrance
const getEventQrCode = asyncHandler(async (req, res) => {
  const result = await qrService.generateEventQrCode(req.params.id);
  res.json(result);
});

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent, getEventParticipants, getEventQrCode };
