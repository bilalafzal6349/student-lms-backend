const jwt = require("jsonwebtoken");
const { TOKEN_EXPIRY } = require("../constants");

/**
 * Generates a short-lived JWT access token.
 * @param {Object} payload - { id, role }
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY.ACCESS });

/**
 * Generates a long-lived refresh token.
 * @param {Object} payload - { id }
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_EXPIRY.REFRESH,
  });

module.exports = { generateAccessToken, generateRefreshToken };
