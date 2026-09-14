const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/async_handler");
const User = require("../models/user_model");
const { USER_STATUS } = require("../config/constants");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }
    if (user.status === USER_STATUS.INACTIVE) {
      return res.status(403).json({ message: "Your account is inactive. Contact an administrator." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
});

module.exports = { protect };
