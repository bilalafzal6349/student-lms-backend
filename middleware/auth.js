const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT from the Authorization: Bearer <token> header.
 * Attaches the decoded payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Role-based access control factory.
 * Usage: authorize('admin') or authorize('admin', 'instructor')
 */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };

module.exports = { verifyToken, authorize };
