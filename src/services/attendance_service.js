const Attendance = require("../models/attendance_model");
const Event = require("../models/event_model");
const EventRegistration = require("../models/event_registration_model");
const { ATTENDANCE_STATUS, REGISTRATION_STATUS, POINTS_RULES } = require("../config/constants");
const { verifyQrToken } = require("../utils/qr_token");
const pointsService = require("./points_service");

const markAttendance = async (eventId, records, checkedByUserId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  if (!records.length || !records[0].userId) {
    const error = new Error("userId (or records[]) is required");
    error.status = 400;
    throw error;
  }

  return Promise.all(
    records.map(async ({ userId, attendanceStatus }) => {
      const nextStatus = attendanceStatus || ATTENDANCE_STATUS.PRESENT;

      const existing = await Attendance.findOne({ event: eventId, user: userId });
      const wasAlreadyPresent = existing?.attendanceStatus === ATTENDANCE_STATUS.PRESENT;

      const attendance = await Attendance.findOneAndUpdate(
        { event: eventId, user: userId },
        {
          event: eventId,
          user: userId,
          attendanceStatus: nextStatus,
          checkedBy: checkedByUserId,
          checkedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (nextStatus === ATTENDANCE_STATUS.PRESENT && !wasAlreadyPresent) {
        await pointsService.awardPoints({
          userId,
          amount: POINTS_RULES.ATTENDANCE,
          reason: `Attended event: ${event.title}`,
          relatedEvent: event._id,
          createdBy: checkedByUserId,
        });
      }

      return attendance;
    })
  );
};

const checkInWithQr = async (token, userId) => {
  let decoded;
  try {
    decoded = verifyQrToken(token);
  } catch (err) {
    const error = new Error("QR code is invalid or has expired");
    error.status = 400;
    throw error;
  }

  const event = await Event.findById(decoded.eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const existing = await Attendance.findOne({ event: event._id, user: userId });
  const wasAlreadyPresent = existing?.attendanceStatus === ATTENDANCE_STATUS.PRESENT;

  const attendance = await Attendance.findOneAndUpdate(
    { event: event._id, user: userId },
    {
      event: event._id,
      user: userId,
      attendanceStatus: ATTENDANCE_STATUS.PRESENT,
      checkedBy: userId,
      checkedAt: new Date(),
      checkedInViaQr: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!wasAlreadyPresent) {
    await pointsService.awardPoints({
      userId,
      amount: POINTS_RULES.ATTENDANCE,
      reason: `Attended event: ${event.title}`,
      relatedEvent: event._id,
      createdBy: userId,
    });
  }

  await EventRegistration.findOneAndUpdate(
    { event: event._id, user: userId },
    { status: REGISTRATION_STATUS.REGISTERED }
  );

  return { attendance, event };
};

const getAttendanceForEvent = async (eventId, statusFilter) => {
  const filter = { event: eventId };
  if (statusFilter) filter.attendanceStatus = statusFilter;
  return Attendance.find(filter).populate("user", "fullName email").populate("checkedBy", "fullName");
};

const getMyAttendanceHistory = async (userId) => {
  return Attendance.find({ user: userId })
    .populate({ path: "event", select: "title date location club", populate: { path: "club", select: "clubName" } })
    .sort({ createdAt: -1 });
};

module.exports = { markAttendance, checkInWithQr, getAttendanceForEvent, getMyAttendanceHistory };