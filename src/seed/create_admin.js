require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user_model");
const { ROLES, USER_STATUS } = require("../config/constants");

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@rccs.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const fullName = process.env.ADMIN_NAME || "System Administrator";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account with email "${email}" already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });

  console.log("Admin account created successfully:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("Log in with POST /api/auth/login, then change the password afterwards.");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to seed admin:", err.message);
  process.exit(1);
});
