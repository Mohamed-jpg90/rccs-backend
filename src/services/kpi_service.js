const Attendance = require("../models/attendance_model");
const EventRegistration = require("../models/event_registration_model");
const UserBadge = require("../models/user_badge_model");
const User = require("../models/user_model");
const { ATTENDANCE_STATUS } = require("../config/constants");

// Personal KPI / participation rate / overall performance for the User module.
const getMyKpi = async (userId) => {
  const [totalRegistrations, totalPresent, totalAbsent, badgesCount, user] = await Promise.all([
    EventRegistration.countDocuments({ user: userId }),
    Attendance.countDocuments({ user: userId, attendanceStatus: ATTENDANCE_STATUS.PRESENT }),
    Attendance.countDocuments({ user: userId, attendanceStatus: ATTENDANCE_STATUS.ABSENT }),
    UserBadge.countDocuments({ user: userId }),
    User.findById(userId),
  ]);

  const totalAttendanceRecords = totalPresent + totalAbsent;
  const participationRate =
    totalAttendanceRecords === 0 ? 0 : Number(((totalPresent / totalAttendanceRecords) * 100).toFixed(2));

  return {
    totalEventsRegistered: totalRegistrations,
    totalPresent,
    totalAbsent,
    participationRate, // %
    totalBadgesEarned: badgesCount,
    totalPoints: user.totalPoints,
  };
};

module.exports = { getMyKpi };
