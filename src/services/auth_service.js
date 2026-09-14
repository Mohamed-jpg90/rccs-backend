const bcrypt = require("bcryptjs");
const User = require("../models/user_model");
const generateToken = require("../utils/generate_token");
const { USER_STATUS } = require("../config/constants");

const register = async ({ fullName, email, password, phoneNumber, club }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("Email is already registered");
    error.status = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // role is NEVER accepted here - public registration always creates a "User".
  const user = await User.create({ fullName, email, password: hashedPassword, phoneNumber, club: club || null });

  const token = generateToken(user._id, user.role);
  return { token, user };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (user.status === USER_STATUS.INACTIVE) {
    const error = new Error("Your account is inactive. Contact an administrator.");
    error.status = 403;
    throw error;
  }

  const token = generateToken(user._id, user.role);
  return { token, user };
};

module.exports = { register, login };
