const ExcelJS = require("exceljs");
const Event = require("../models/event_model");
const EventRegistration = require("../models/event_registration_model");
const Attendance = require("../models/attendance_model");
const EventFeedback = require("../models/feedback_model");

const styleHeader = (sheet) => {
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
};

const buildEventWorkbook = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("club", "clubName")
    .populate("createdBy", "fullName");

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const [registrations, attendance, feedback] = await Promise.all([
    EventRegistration.find({ event: eventId })
      .populate("user", "fullName email phoneNumber")
      .populate("reviewedBy", "fullName"),
    Attendance.find({ event: eventId })
      .populate("user", "fullName email phoneNumber")
      .populate("checkedBy", "fullName"),
    EventFeedback.find({ event: eventId }).populate("user", "fullName email"),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  // --- Event info ---
  const info = wb.addWorksheet("Event");
  info.columns = [
    { header: "Field", key: "k", width: 24 },
    { header: "Value", key: "v", width: 60 },
  ];
  const present = attendance.filter((a) => a.attendanceStatus === "Present").length;
  const absent = attendance.filter((a) => a.attendanceStatus === "Absent").length;
  info.addRows([
    { k: "Title", v: event.title },
    { k: "Description", v: event.description },
    { k: "Club", v: event.club?.clubName || "" },
    { k: "Location", v: event.location },
    { k: "Date", v: event.date ? new Date(event.date).toISOString().slice(0, 10) : "" },
    { k: "Time", v: event.time },
    { k: "Capacity", v: event.capacity },
    { k: "Registration Deadline", v: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 10) : "" },
    { k: "Status", v: event.status },
    { k: "Requires Approval", v: event.requiresApproval ? "Yes" : "No" },
    { k: "Created By", v: event.createdBy?.fullName || "" },
    { k: "Total Registrations", v: registrations.length },
    { k: "Present", v: present },
    { k: "Absent", v: absent },
    { k: "Attendance Rate", v: registrations.length ? `${Math.round((present / registrations.length) * 100)}%` : "0%" },
    { k: "Average Rating", v: feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(2) : "N/A" },
  ]);
  styleHeader(info);

  // --- Registrations ---
  const regs = wb.addWorksheet("Registrations");
  regs.columns = [
    { header: "Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Registered At", key: "createdAt", width: 20 },
    { header: "Reviewed By", key: "reviewedBy", width: 22 },
    { header: "Reviewed At", key: "reviewedAt", width: 20 },
  ];
  registrations.forEach((r) =>
    regs.addRow({
      name: r.user?.fullName || "Deleted user",
      email: r.user?.email || "",
      phone: r.user?.phoneNumber || "",
      status: r.status,
      createdAt: r.createdAt,
      reviewedBy: r.reviewedBy?.fullName || "",
      reviewedAt: r.reviewedAt || "",
    })
  );
  regs.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";
  regs.getColumn("reviewedAt").numFmt = "yyyy-mm-dd hh:mm";
  styleHeader(regs);

  // --- Attendance ---
  const att = wb.addWorksheet("Attendance");
  att.columns = [
    { header: "Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Checked At", key: "checkedAt", width: 20 },
    { header: "Checked By", key: "checkedBy", width: 22 },
    { header: "Via", key: "via", width: 10 },
  ];
  attendance.forEach((a) =>
    att.addRow({
      name: a.user?.fullName || "Deleted user",
      email: a.user?.email || "",
      phone: a.user?.phoneNumber || "",
      status: a.attendanceStatus,
      checkedAt: a.checkedAt || "",
      checkedBy: a.checkedBy?.fullName || "",
      via: a.checkedInViaQr ? "QR" : "Manual",
    })
  );
  att.getColumn("checkedAt").numFmt = "yyyy-mm-dd hh:mm";
  styleHeader(att);

  // --- Feedback ---
  const fb = wb.addWorksheet("Feedback");
  fb.columns = [
    { header: "Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Rating", key: "rating", width: 10 },
    { header: "Comment", key: "comment", width: 60 },
    { header: "Date", key: "createdAt", width: 20 },
  ];
  feedback.forEach((f) =>
    fb.addRow({
      name: f.user?.fullName || "Deleted user",
      email: f.user?.email || "",
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
    })
  );
  fb.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";
  styleHeader(fb);

  return wb;
};

module.exports = { buildEventWorkbook };