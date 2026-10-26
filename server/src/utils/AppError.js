/**
 * Custom Operational Application Error
 * 
 * Used to throw anticipated, client-facing HTTP errors with appropriate
 * status codes, user-safe messages, and optional validation error details.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 403, 404, 409)
   * @param {Array<object>} [errors=[]] - Optional detailed field validation errors
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
