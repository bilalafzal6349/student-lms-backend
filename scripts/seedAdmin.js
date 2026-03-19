/**
 * One-time script to create the first admin user.
 * Run with: node backend/scripts/seedAdmin.js
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD env vars or edit the defaults below.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const EMAIL = process.env.ADMIN_EMAIL || "admin@learnhub.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234";
const NAME = process.env.ADMIN_NAME || "Admin";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Updated existing user ${EMAIL} to admin.`);
    } else {
      console.log(`Admin ${EMAIL} already exists.`);
    }
    await mongoose.disconnect();
    return;
  }

  const admin = new User({ name: NAME, email: EMAIL, role: "admin" });
  await admin.setPassword(PASSWORD);
  await admin.save();

  console.log(`✓ Admin created: ${EMAIL} / ${PASSWORD}`);
  console.log("  Change the password after first login!");
  await mongoose.disconnect();
})();
