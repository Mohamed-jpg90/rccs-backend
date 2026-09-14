const asyncHandler = require("../utils/async_handler");
const attendanceService = require("../services/attendance_service");
const { ATTENDANCE_STATUS } = require("../config/constants");

const markAttendance = asyncHandler(async (req, res) => {
  const records = req.body.records || [{ userId: req.body.userId, attendanceStatus: req.body.attendanceStatus }];
  const attendance = await attendanceService.markAttendance(req.params.id, records, req.user._id);
  res.json({ attendance });
});

// User scans the event QR code and checks themselves in.
const checkInWithQr = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "token is required" });

  const { attendance, event } = await attendanceService.checkInWithQr(token, req.user._id);
  res.json({ message: `Checked in to "${event.title}" successfully`, attendance });
});

const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getAttendanceForEvent(req.params.id);
  res.json({ total: attendance.length, attendance });
});

const getPresentAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getAttendanceForEvent(req.params.id, ATTENDANCE_STATUS.PRESENT);
  res.json({ total: attendance.length, attendance });
});

const getAbsentAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getAttendanceForEvent(req.params.id, ATTENDANCE_STATUS.ABSENT);
  res.json({ total: attendance.length, attendance });
});

// GET /api/me/attendance — the User's own history (Present/Absent)
const getMyAttendanceHistory = asyncHandler(async (req, res) => {
  const history = await attendanceService.getMyAttendanceHistory(req.user._id);
  res.json({ total: history.length, history });
});

module.exports = {
  markAttendance,
  checkInWithQr,
  getAttendance,
  getPresentAttendance,
  getAbsentAttendance,
  getMyAttendanceHistory,
};
