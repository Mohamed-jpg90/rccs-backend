const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes/index");
const { notFound, errorHandler } = require("./middlewares/error_middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Serve uploaded images/PDFs statically, e.g. http://localhost:5000/uploads/coverImage-123.jpg
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
