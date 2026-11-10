const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user_model");

const generateTempPassword = () => crypto.randomBytes(9).toString("base64url"); // ~12 chars

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const notFound = () => {
  const error = new Error("User not found");
  error.status = 404;
  return error;
};

// Admin picks an email. Uses the given newPassword, or generates a temp one.
const resetPasswordByEmail = async (email, newPassword) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw notFound();

  const plain = newPassword || generateTempPassword();
  user.password = await hashPassword(plain);
  await user.save();

  return {
    user: { id: user._id, fullName: user.fullName, email: user.email },
    // only returned when we generated it, so the admin can hand it to the user
    temporaryPassword: newPassword ? undefined : plain,
  };
};

// Admin sets a password for any user by id.
const setPasswordById = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw notFound();

  user.password = await hashPassword(newPassword);
  await user.save();

  return { id: user._id, fullName: user.fullName, email: user.email };
};


const changeMyPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw notFound();

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.status = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error("New password must be different from the current one");
    error.status = 400;
    throw error;
  }

  user.password = await hashPassword(newPassword);
  await user.save();
};

module.exports = { resetPasswordByEmail, setPasswordById, changeMyPassword };