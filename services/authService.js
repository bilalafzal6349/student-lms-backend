const crypto = require("crypto");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { ROLES, OTP_EXPIRY_MS, HTTP } = require("../constants");

/**
 * Registers a new user. Defaults role to 'student'.
 * Throws if the email is already taken.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = HTTP.CONFLICT;
    throw err;
  }

  const user = new User({ name, email, role: role || ROLES.STUDENT });
  await user.setPassword(password);
  await user.save();
  return user;
};

/**
 * Validates credentials and returns access + refresh tokens.
 * Throws 401 on invalid credentials.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password");
    err.status = HTTP.UNAUTHORIZED;
    throw err;
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });
  return { accessToken, refreshToken, user };
};

/**
 * Generates a 6-digit OTP, stores its hash + expiry on the user,
 * and sends it via email.
 */
const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  // Silently succeed to prevent email enumeration
  if (!user) return;

  const otp = crypto.randomInt(100000, 999999).toString();
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendEmail({
    to: email,
    subject: "Your LMS Password Reset OTP",
    text: `Your OTP is: ${otp}. It expires in 15 minutes.`,
  });
};

/**
 * Validates the OTP and updates the user's password.
 * Throws 400 on invalid or expired OTP.
 */
const confirmPasswordReset = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user || user.resetOtp !== otp || user.resetOtpExpiry < new Date()) {
    const err = new Error("Invalid or expired OTP");
    err.status = HTTP.BAD_REQUEST;
    throw err;
  }

  await user.setPassword(newPassword);
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  confirmPasswordReset,
};
