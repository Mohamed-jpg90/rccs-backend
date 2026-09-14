const Event = require("../models/event_model");
const Attendance = require("../models/attendance_model");
const { EVENT_STATUS } = require("../config/constants");

// const computeCurrentStatus = (event) => {
//   if (event.status === EVENT_STATUS.CANCELLED) return EVENT_STATUS.CANCELLED;

//   const now = new Date();
//   const eventDate = new Date(event.date);

//   const startOfEventDay = new Date(eventDate);
//   startOfEventDay.setHours(0, 0, 0, 0);

//   const endOfEventDay = new Date(eventDate);
//   endOfEventDay.setHours(23, 59, 59, 999);

//   if (now > endOfEventDay) return EVENT_STATUS.FINISHED;
//   if (now >= startOfEventDay && now <= endOfEventDay) return EVENT_STATUS.ONGOING;
//   return EVENT_STATUS.UPCOMING;
// };


const computeCurrentStatus = (event) => {
  if (event.status === EVENT_STATUS.CANCELLED) {
    return EVENT_STATUS.CANCELLED;
  }

  const now = new Date();

  // Event date
  const eventDate = new Date(event.date);

  // Start of event
  const startTime = new Date(eventDate);

  const [hours, minutes] = event.time.split(":");

  startTime.setHours(Number(hours), Number(minutes), 0, 0);

  // End of event = event time + 2 minutes
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 2);

  if (now >= endTime) {
    return EVENT_STATUS.FINISHED;
  }

  if (now >= startTime) {
    return EVENT_STATUS.ONGOING;
  }

  return EVENT_STATUS.UPCOMING;
};

const syncEventStatus = async (event) => {
  const correctStatus = computeCurrentStatus(event);
  if (event.status !== correctStatus) {
    event.status = correctStatus;
    await event.save();
  }
  return event;
};

const syncEventStatuses = async (events) => Promise.all(events.map((event) => syncEventStatus(event)));

const createEvent = async (data, creatorId, uploadedFile) => {
  return Event.create({
    title: data.title,
    description: data.description,
    club: data.club,
    location: data.location,
    date: data.date,
    time: data.time,
    capacity: data.capacity,
    registrationDeadline: data.registrationDeadline,
    status: data.status,
    requiresApproval: data.requiresApproval,
    createdBy: creatorId,
    coverImage: uploadedFile ? `/uploads/${uploadedFile.filename}` : null,
  });
};

const getEvents = async ({ search, club, status, page = 1, limit = 20 }) => {
  const filter = {};
  if (club) filter.club = club;
  if (search) filter.title = { $regex: search, $options: "i" };

  let events = await Event.find(filter)
    .populate("club", "clubName")
    .populate("createdBy", "fullName")
    .sort({ date: -1 });

  events = await syncEventStatuses(events);

  if (status) events = events.filter((e) => e.status === status);

  const skip = (Number(page) - 1) * Number(limit);
  const total = events.length;
  const paged = events.slice(skip, skip + Number(limit));

  return { events: paged, total, page: Number(page), limit: Number(limit) };
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate("club", "clubName").populate("createdBy", "fullName");
  if (!event) return null;
  return syncEventStatus(event);
};

const updateEvent = async (id, updates, uploadedFile) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const fields = ["title", "description", "location", "date", "time", "capacity", "registrationDeadline", "status", "requiresApproval"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) event[field] = updates[field];
  });
  if (uploadedFile) event.coverImage = `/uploads/${uploadedFile.filename}`;

  await event.save();
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }
  return event;
};

const getEventParticipants = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }
  return Attendance.find({ event: eventId }).populate("user", "fullName email phoneNumber");
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, getEventParticipants, computeCurrentStatus, syncEventStatus };