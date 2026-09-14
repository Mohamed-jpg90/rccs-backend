const asyncHandler = require("../utils/async_handler");
const notificationService = require("../services/notification_service");

const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json({ notification });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotificationsForUser(req.user, req.query.all);
  res.json({ total: notifications.length, notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id);
  res.json({ notification });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);
  res.json({ message: "Notification deleted successfully" });
});

module.exports = { createNotification, getNotifications, markNotificationRead, deleteNotification };
