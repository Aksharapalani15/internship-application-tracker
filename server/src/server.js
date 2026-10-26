const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { testConnection, closePool } = require("./config/db");

/**
 * Validates critical environment configuration before starting the HTTP server.
 */
function validateStartupEnvironment() {
  const isProduction = process.env.NODE_ENV === "production";
  const requiredVars = ["PORT", "CLIENT_ORIGIN", "DB_HOST", "DB_USER", "JWT_SECRET"];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(
      `\x1b[31m[Fatal Startup Error] Missing required environment variables: ${missing.join(", ")}\x1b[0m`
    );
    console.error(
      "Please configure these variables in your .env file before launching the server."
    );
    process.exit(1);
  }

  // Reject weak default secrets in production
  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    console.error(
      "\x1b[31m[Security Violation] JWT_SECRET must be at least 32 characters in production.\x1b[0m"
    );
    process.exit(1);
  }
}

validateStartupEnvironment();

const PORT = Number(process.env.PORT) || 5000;

let server;

async function startServer() {
  try {
    // 1. Verify database connectivity
    console.log("[Database] Verifying MySQL connection pool...");
    await testConnection();
    console.log("\x1b[32m[Database] Connection successfully established.\x1b[0m");

    // 2. Start HTTP server
    server = app.listen(PORT, () => {
      console.log(
        `\x1b[32m[Server] Internship Tracker REST API is running on port ${PORT} [${process.env.NODE_ENV || "development"}]\x1b[0m`
      );
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("\x1b[31m[Server] Failed to initialize server:\x1b[0m", error.message);
    process.exit(1);
  }
}

/**
 * Handles graceful process termination
 * 
 * @param {string} signal - Signal name (SIGINT, SIGTERM)
 */
async function handleShutdown(signal) {
  console.log(`\n[Process] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log("[Server] Closed HTTP listener. No longer accepting new connections.");
    });
  }

  try {
    await closePool();
    console.log("[Database] Closed MySQL connection pool.");
    process.exit(0);
  } catch (err) {
    console.error("[Database] Error while terminating connection pool:", err.message);
    process.exit(1);
  }
}

// Graceful shutdown listeners
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// Unhandled rejection and exception diagnostics
process.on("unhandledRejection", (reason) => {
  console.error("[Process] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Process] Uncaught Exception:", error);
  process.exit(1);
});

startServer();
