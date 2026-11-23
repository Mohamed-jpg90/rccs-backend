const User = require("../models/user_model");
const Club = require("../models/club_model");
const Event = require("../models/event_model");
const Attendance = require("../models/attendance_model");
const EventRegistration = require("../models/event_registration_model");
const ClubMembershipRequest = require("../models/club_membership_request_model");
const {
  ROLES,
  ATTENDANCE_STATUS,
  CLUB_JOIN_STATUS,
  REGISTRATION_STATUS,
} = require("../config/constants");

// Team Leader / Admin: list of a club's regular members (not the leaders themselves).
const getClubMembers = async (clubId, { search, page = 1, limit = 20 }) => {
  const filter = { club: clubId, role: ROLES.USER };
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [members, total] = await Promise.all([
    User.find(filter)
      .select("fullName email phoneNumber profileImage totalPoints createdAt")
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return { members, total, page: Number(page), limit: Number(limit) };
};

// Top 3 members of this specific club by totalPoints.
const getClubTop3 = async (clubId) => {
  const top3 = await User.find({ club: clubId, role: ROLES.USER })
    .select("fullName profileImage totalPoints")
    .sort({ totalPoints: -1 })
    .limit(3);

  return top3.map((u, index) => ({ rank: index + 1, ...u.toObject() }));
};

// Simple headcount / capacity stats for the club.
const getClubStats = async (clubId) => {
  const club = await Club.findById(clubId);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }

  const totalMembers = await User.countDocuments({ club: clubId, role: ROLES.USER });

  return {
    totalMembers,
    maxMembers: club.maxMembers,
    fillRate: club.maxMembers ? Number(((totalMembers / club.maxMembers) * 100).toFixed(2)) : 0,
  };
};

// Chart-ready data: member growth over time, event attendance per event, points spread.
const getClubAnalytics = async (clubId) => {
  const club = await Club.findById(clubId);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }

  const [totalMembers, top3, monthlyGrowthRaw, events] = await Promise.all([
    User.countDocuments({ club: clubId, role: ROLES.USER }),
    getClubTop3(clubId),
    ClubMembershipRequest.aggregate([
      { $match: { club: club._id, status: CLUB_JOIN_STATUS.APPROVED } },
      { $group: { _id: { year: { $year: "$reviewedAt" }, month: { $month: "$reviewedAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Event.find({ club: clubId }).select("_id title date"),
  ]);

  const eventIds = events.map((e) => e._id);

  const [attendanceAgg, attendanceSummary] = await Promise.all([
    Attendance.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: { event: "$event", status: "$attendanceStatus" }, count: { $sum: 1 } } },
    ]),
    EventRegistration.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          status: { $in: [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED] },
        },
      },
      {
        $lookup: {
          from: Attendance.collection.name,
          let: { eventId: "$event", userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$event", "$$eventId"] },
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$attendanceStatus", ATTENDANCE_STATUS.PRESENT] },
                  ],
                },
              },
            },
          ],
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
  ]);

  const totalConfirmedRegistrations = attendanceSummary[0]?.total || 0;
  const totalPresent = attendanceSummary[0]?.present || 0;
  const attendanceRate =
    totalConfirmedRegistrations === 0
      ? 0
      : Number(((totalPresent / totalConfirmedRegistrations) * 100).toFixed(2));

  const eventAttendance = events.map((e) => {
    const present =
      attendanceAgg.find((a) => String(a._id.event) === String(e._id) && a._id.status === ATTENDANCE_STATUS.PRESENT)
        ?.count || 0;
    const absent =
      attendanceAgg.find((a) => String(a._id.event) === String(e._id) && a._id.status === ATTENDANCE_STATUS.ABSENT)
        ?.count || 0;

    return { eventId: e._id, title: e.title, date: e.date, present, absent };
  });

  const pointsDistribution = await User.aggregate([
    { $match: { club: club._id, role: ROLES.USER } },
    {
      $bucket: {
        groupBy: "$totalPoints",
        boundaries: [0, 100, 250, 500, 1000, 5000],
        default: "5000+",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  return {
    clubName: club.clubName,
    totalMembers,
    maxMembers: club.maxMembers,
    fillRate: club.maxMembers ? Number(((totalMembers / club.maxMembers) * 100).toFixed(2)) : 0,
    attendanceRate,
    top3,
    monthlyMemberGrowth: monthlyGrowthRaw.map((m) => ({ year: m._id.year, month: m._id.month, count: m.count })),
    eventAttendance,
    pointsDistribution,
  };
};

module.exports = { getClubMembers, getClubTop3, getClubStats, getClubAnalytics };
