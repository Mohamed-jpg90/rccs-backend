const Notification = require("../models/notification_model");

let ioInstance = null;
// Wired up once from sockets/socket_manager.js at server start.
const attachSocketIO = (io) => {
  ioInstance = io;
};

const createNotification = async ({ title, message, type, receiver, receiverRole }) => {
  const notification = await Notification.create({
    title,
    message,
    type: type || "General",
    receiver: receiver || null,
    receiverRole: receiverRole || "All",
  });

  // Real-time push over Socket.IO, in addition to the persisted record above.
  if (ioInstance) {
    const room = receiver ? `user:${receiver}` : `role:${receiverRole || "All"}`;
    ioInstance.to(room).emit("notification:new", notification);
  }

  return notification;
};

const getNotificationsForUser = async (user, all) => {
  let filter = {};
  if (all !== "true") {
    filter = { $or: [{ receiver: user._id }, { receiverRole: user.role }, { receiverRole: "All" }] };
  }
  return Notification.find(filter).sort({ createdAt: -1 });
};

const markRead = async (id) => {
  const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  if (!notification) {
    const error = new Error("Notification not found");
    error.status = 404;
    throw error;
  }
  return notification;
};

const deleteNotification = async (id) => {
  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) {
    const error = new Error("Notification not found");
    error.status = 404;
    throw error;
  }
  return notification;
};

module.exports = {
  attachSocketIO,
  createNotification,
  getNotificationsForUser,
  markRead,
  deleteNotification,
};
