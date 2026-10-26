/**
 * Higher-order utility to wrap asynchronous route handlers and middleware.
 * Automatically catches any rejected Promise and forwards the error to next().
 * 
 * @param {Function} fn - Async express route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
