const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/**
 * 1. Security Headers via Helmet
 * Sets essential HTTP headers (Content-Security-Policy, HSTS, X-Content-Type-Options, etc.)
 */
app.use(helmet());

/**
 * 2. Cross-Origin Resource Sharing (CORS) Configuration
 * Explicitly binds to the frontend origin and permits credentialed cookie transmission.
 */
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin || origin === clientOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * 3. Request Parsing & Payload Size Limits
 * Mitigates denial-of-service (DoS) via oversized request payloads.
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/**
 * 4. Cookie Parser
 * Parses incoming Cookie header and populates req.cookies.
 */
app.use(cookieParser());

/**
 * 5. Health Check Endpoint
 * Quick liveness check for load balancers and deployment monitors.
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 6. API Route Registration
 */
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

/**
 * 7. 404 Route Not Found Handler
 */
app.use(notFound);

/**
 * 8. Centralized Global Error Handler
 */
app.use(errorHandler);

module.exports = app;
