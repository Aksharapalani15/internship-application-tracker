const AppError = require("../utils/AppError");

/**
 * Catches all unhandled routes and forwards a 404 AppError to the global error handler.
 */
function notFound(req, res, next) {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
}

module.exports = notFound;
