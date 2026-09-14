require("dotenv").config();
const http = require("http");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const initSocket = require("./src/sockets/socket_manager");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`RCCS Admin API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    console.log("Socket.IO real-time notifications are live.");
  });
};

startServer();
