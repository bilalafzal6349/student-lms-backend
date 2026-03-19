/**
 * Global error handler middleware.
 * Catches errors forwarded via next(err) and returns a consistent JSON response.
 * Mongoose validation errors are mapped to 400; everything else defaults to 500.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
};

module.exports = errorHandler;
