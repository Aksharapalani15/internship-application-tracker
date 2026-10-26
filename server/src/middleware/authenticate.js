const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { COOKIE_NAME } = require("../utils/cookies");
const { pool } = require("../config/db");

/**
 * Authentication Middleware
 * 
 * Extracts JWT from secure HTTP-only cookies (or Authorization header as fallback),
 * verifies signature and expiration, and attaches the authenticated user entity to req.user.
 * 
 * SECURITY RULES:
 * 1. Explicit HS256 algorithm enforcement prevents algorithm confusion attacks (e.g. 'none').
 * 2. Token authenticity verified before querying database.
 * 3. User existence re-verified to prevent deactivated or deleted accounts from retaining access.
 * 4. Never trusts client-supplied user IDs in URL or body.
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Primary: Extract from secure HTTP-only cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }
    // 2. Secondary fallback: Extract from Authorization Bearer header (enables easy testing via Postman / curl)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("Authentication required. Please log in to continue.", 401)
      );
    }

    const secret = process.env.JWT_SECRET || "fallback_dev_secret_change_in_production";

    // Explicitly enforce algorithms to prevent 'none' algorithm bypass attacks
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    // Verify user still exists in the database
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(
        new AppError(
          "The user session belongs to an account that no longer exists.",
          401
        )
      );
    }

    // Attach authenticated identity to request
    req.user = {
      id: Number(rows[0].id),
      name: rows[0].name,
      email: rows[0].email,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(error);
    }
    next(error);
  }
}

module.exports = authenticate;
