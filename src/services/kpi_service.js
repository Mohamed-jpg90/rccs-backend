const Attendance = require("../models/attendance_model");
const EventRegistration = require("../models/event_registration_model");
const UserBadge = require("../models/user_badge_model");
const User = require("../models/user_model");
const { ATTENDANCE_STATUS, REGISTRATION_STATUS } = require("../config/constants");

// Personal KPI / participation rate / overall performance for the User module.
const getMyKpi = async (userId) => {
  const [attendanceSummary, totalAbsent, badgesCount, user] = await Promise.all([
    // Attendance rows are generally created only when somebody checks in.  Using
    // them as the denominator therefore makes every checked-in user look like
    // they have a 100% attendance rate.  Confirmed registrations are the full
    // set of events against which attendance must be measured.
    EventRegistration.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED] },
        },
      },
      {
        $lookup: {
          from: Attendance.collection.name,
          let: { eventId: "$event", userId: "$user" },
          pipeline: [{
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$event", "$$eventId"] },
                  { $eq: ["$user", "$$userId"] },
                  { $eq: ["$attendanceStatus", ATTENDANCE_STATUS.PRESENT] },
                ],
              },
            },
          }],
          as: "presentAttendance",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $gt: [{ $size: "$presentAttendance" }, 0] }, 1, 0] } },
        },
      },
    ]),
    Attendance.countDocuments({ user: userId, attendanceStatus: ATTENDANCE_STATUS.ABSENT }),
    UserBadge.countDocuments({ user: userId }),
    User.findById(userId),
  ]);

  const totalRegistrations = attendanceSummary[0]?.total || 0;
  const totalPresent = attendanceSummary[0]?.present || 0;
  const participationRate =
    totalRegistrations === 0 ? 0 : Number(((totalPresent / totalRegistrations) * 100).toFixed(2));

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
