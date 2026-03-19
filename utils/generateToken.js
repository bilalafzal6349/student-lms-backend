const jwt = require("jsonwebtoken");

/**
 * Generates a short-lived JWT access token (15 minutes).
 * @param {Object} payload - { id, role }
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

/**
 * Generates a long-lived refresh token (7 days).
 * @param {Object} payload - { id }
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

module.exports = { generateAccessToken, generateRefreshToken };
