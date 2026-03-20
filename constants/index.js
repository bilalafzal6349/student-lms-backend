/** User roles */
const ROLES = Object.freeze({
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
});

/** JWT token expiry */
const TOKEN_EXPIRY = Object.freeze({
  ACCESS: "15m",
  REFRESH: "7d",
});

/** Refresh token cookie max-age in milliseconds (7 days) */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/** OTP expiry in milliseconds (15 minutes) */
const OTP_EXPIRY_MS = 15 * 60 * 1000;

/** Bcrypt salt rounds */
const BCRYPT_ROUNDS = 12;

/** Upload limits */
const UPLOAD = Object.freeze({
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_PREFIX: "image/",
  FOLDERS: Object.freeze({
    AVATARS: "avatars",
    THUMBNAILS: "thumbnails",
  }),
});

/** Rate limiter config */
const RATE_LIMIT = Object.freeze({
  GLOBAL: Object.freeze({ WINDOW_MS: 15 * 60 * 1000, MAX: 100 }),
  AUTH: Object.freeze({ WINDOW_MS: 60 * 60 * 1000, MAX: 20 }),
});

/** Default pagination */
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
});

/** HTTP status codes */
const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
});

module.exports = {
  ROLES,
  TOKEN_EXPIRY,
  REFRESH_COOKIE_MAX_AGE,
  OTP_EXPIRY_MS,
  BCRYPT_ROUNDS,
  UPLOAD,
  RATE_LIMIT,
  PAGINATION,
  HTTP,
};
