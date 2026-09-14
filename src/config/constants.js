const ROLES = Object.freeze({
  ADMIN: "Admin",
  TEAM_LEADER: "Team Leader",
  USER: "User",
});

const USER_STATUS = Object.freeze({
  ACTIVE: "Active",
  INACTIVE: "Inactive",
});

const EVENT_STATUS = Object.freeze({
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  FINISHED: "Finished",
  CANCELLED: "Cancelled",
});

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "Present",
  ABSENT: "Absent",
  PENDING: "Pending",
});

const ANNOUNCEMENT_PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
});

const REGISTRATION_STATUS = Object.freeze({
  PENDING: "Pending",     // waiting for Admin/Team Leader approval
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REGISTERED: "Registered", // auto-confirmed, no approval required
  CANCELLED: "Cancelled",
});

const POINTS_TYPE = Object.freeze({
  EARN: "Earn",
  DEDUCT: "Deduct",
});

const CERTIFICATE_TYPE = Object.freeze({
  CERTIFICATE: "Certificate",
  RECOMMENDATION_LETTER: "Recommendation Letter",
});

const CONTENT_TYPE = {
  DRIVE: "Drive",
  YOUTUBE: "YouTube",
};

const REMOVAL_REQUEST_STATUS = Object.freeze({
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});
const CLUB_JOIN_STATUS = Object.freeze({
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
});

const REMOVAL_REQUEST_SCOPE = {
  CLUB: "club",     // remove from this club only, keep the account
  SYSTEM: "system", // remove from club AND delete the account entirely
};

const POINTS_RULES = Object.freeze({
  ATTENDANCE: 5,
  EVENT_REGISTRATION: 2,
  FEEDBACK_SUBMITTED: 3,
  CLUB_JOIN_APPROVED: 10,
});

module.exports = {
  ROLES,
  USER_STATUS,
  EVENT_STATUS,
  ATTENDANCE_STATUS,
  ANNOUNCEMENT_PRIORITY,
  REGISTRATION_STATUS,
  POINTS_TYPE,
  CERTIFICATE_TYPE,
  CONTENT_TYPE,
  REMOVAL_REQUEST_STATUS,
  CLUB_JOIN_STATUS,
  REMOVAL_REQUEST_SCOPE,
  CONTENT_TYPE,
  POINTS_RULES,
};
