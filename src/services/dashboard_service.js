const User = require("../models/user_model");
const Club = require("../models/club_model");
const Event = require("../models/event_model");
const Attendance = require("../models/attendance_model");
const UserBadge = require("../models/user_badge_model");
const Announcement = require("../models/announcement_model");
const Notification = require("../models/notification_model");
const { ROLES, EVENT_STATUS, ATTENDANCE_STATUS } = require("../config/constants");
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalTeamLeaders,
    totalClubs,
    totalEvents,
    upcomingEvents,
    totalAttendanceRecords,
    presentAttendanceRecords,
    totalBadgesAwarded,
    recentAnnouncements,
    latestNotifications,
    monthlyUserGrowth,
    monthlyAttendanceRate, // جديد
    clubStatistics,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.TEAM_LEADER }),
    Club.countDocuments(),
    Event.countDocuments(),
    Event.countDocuments({ status: EVENT_STATUS.UPCOMING }),
    Attendance.countDocuments(),
    Attendance.countDocuments({ attendanceStatus: ATTENDANCE_STATUS.PRESENT }),
    UserBadge.countDocuments(),
    Announcement.find().sort({ createdAt: -1 }).limit(5),
    Notification.find().sort({ createdAt: -1 }).limit(5),
    User.aggregate([
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
    Attendance.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$attendanceStatus", ATTENDANCE_STATUS.PRESENT] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          total: 1,
          present: 1,
          rate: {
            $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$present", "$total"] }, 100] }],
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
    Club.aggregate([
      {
        $project: {
          clubName: 1,
          maxMembers: 1,
          currentMembersCount: 1,
          fillRate: {
            $cond: [
              { $eq: ["$maxMembers", 0] },
              0,
              { $multiply: [{ $divide: ["$currentMembersCount", "$maxMembers"] }, 100] },
            ],
          },
        },
      },
    ]),
  ]);

  const attendanceRate =
    totalAttendanceRecords === 0 ? 0 : Number(((presentAttendanceRecords / totalAttendanceRecords) * 100).toFixed(2));

  return {
    totalUsers,
    totalTeamLeaders,
    totalClubs,
    totalEvents,
    upcomingEvents,
    attendanceRate,
    totalBadgesAwarded,
    recentAnnouncements,
    latestNotifications,
    monthlyUserGrowth,
    monthlyAttendanceRate, // جديد
    clubStatistics,
  };
};


// Top N members by totalPoints, plus lightweight analysis for the dashboard.
const getTopMembersByPoints = async (limit = 20) => {
  const topMembersRaw = await User.find({ role: ROLES.USER })
    .select("fullName profileImage totalPoints club")
    .populate("club", "clubName")
    .sort({ totalPoints: -1 })
    .limit(Number(limit));

  const topMembers = topMembersRaw.map((u, index) => ({
    rank: index + 1,
    _id: u._id,
    fullName: u.fullName,
    profileImage: u.profileImage,
    totalPoints: u.totalPoints,
    club: u.club ? { _id: u.club._id, clubName: u.club.clubName } : null,
  }));

  const totalPoints = topMembers.reduce((sum, m) => sum + (m.totalPoints || 0), 0);
  const averagePoints = topMembers.length ? Math.round(totalPoints / topMembers.length) : 0;

  const clubCounts = {};
  topMembers.forEach((m) => {
    if (m.club) clubCounts[m.club.clubName] = (clubCounts[m.club.clubName] || 0) + 1;
  });

  let topClub = null;
  let topClubCount = 0;
  Object.entries(clubCounts).forEach(([clubName, count]) => {
    if (count > topClubCount) {
      topClub = clubName;
      topClubCount = count;
    }
  });

  return {
    topMembers,
    insights: { averagePoints, topClub, topClubCount },
  };
};

module.exports = { getDashboardStats, getTopMembersByPoints };
