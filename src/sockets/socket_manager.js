const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const notificationService = require("../services/notification_service");

/**
 * Real-time in-app notifications (announcements, event updates, badge awards,
 * attendance confirmations, points updates).
 *
 * Client connects with: io(URL, { auth: { token: "<JWT>" } })
 * and is automatically joined to:
 *   - room `user:<their id>`     -> for notifications sent to them personally
 *   - room `role:<their role>`   -> for notifications sent to their whole role
 *   - room `role:All`            -> for broadcasts to everyone
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
    socket.join("role:All");

    socket.on("disconnect", () => {});
  });

  notificationService.attachSocketIO(io);

  return io;
};

module.exports = initSocket;
