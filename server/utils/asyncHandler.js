// utils/asyncHandler.js

/**
 * Async handler middleware to handle asynchronous functions.
 *
 * @param {Function} fn - The asynchronous function to execute.
 * @returns {Function} A middleware function with error handling for async operations.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
export default asyncHandler;

