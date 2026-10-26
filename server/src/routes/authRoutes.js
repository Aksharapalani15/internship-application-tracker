const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidators");

const router = express.Router();

/**
 * Authentication Rate Limiter
 * 
 * Mitigates brute-force credential stuffing and password guessing attacks
 * by restricting authentication attempts per IP address window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
    errors: [],
  },
});

// Registration endpoint
router.post(
  "/register",
  authLimiter,
  validate(registerSchema, "body"),
  authController.register
);

// Login endpoint
router.post(
  "/login",
  authLimiter,
  validate(loginSchema, "body"),
  authController.login
);

// Logout endpoint
router.post("/logout", authController.logout);

// Current user profile check endpoint (Requires authentication)
router.get("/me", authenticate, authController.getMe);

module.exports = router;
