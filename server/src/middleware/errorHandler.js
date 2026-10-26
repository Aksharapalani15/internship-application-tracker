const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

/**
 * Centralized Global Error Handler Middleware
 * 
 * Intercepts all application errors, translates library and database exceptions
 * into uniform, secure HTTP responses, and protects against data leakage.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected internal server error occurred";
  let errors = err.errors || [];

  // 1. Handle custom operational AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // 2. Handle JSON parsing syntax error from express.json()
  else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON syntax in request body";
    errors = [{ field: "body", message: "Invalid JSON format" }];
  }

  // 2. Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Request validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }));
  }

  // 3. Handle MySQL Duplicate Key (e.g. unique email)
  else if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    if (err.message.includes("idx_users_unique_email") || err.message.includes("email")) {
      message = "An account with this email address already exists";
      errors = [{ field: "email", message: "Email is already registered" }];
    } else {
      message = "A record with this unique identifier already exists";
    }
  }

  // 4. Handle MySQL Foreign Key constraint violations
  else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Referenced parent record does not exist";
  }

  // 5. Handle MySQL connection failures
  else if (
    err.code === "ECONNREFUSED" ||
    err.code === "PROTOCOL_CONNECTION_LOST" ||
    err.code === "ER_ACCESS_DENIED_ERROR"
  ) {
    statusCode = 503;
    message = "Database service is temporarily unavailable. Please try again shortly.";
  }

  // 6. Handle JWT verification errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication session has expired. Please log in again.";
  }

  // Log unhandled non-operational errors (status 500) for server-side diagnostics
  if (statusCode >= 500) {
    console.error(`[Server Error ${new Date().toISOString()}]:`, err);
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  const responseBody = {
    success: false,
    message,
    errors,
  };

  // Only expose stack trace in non-production environments when diagnosing unhandled crashes
  if (isDevelopment && statusCode >= 500) {
    responseBody.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
