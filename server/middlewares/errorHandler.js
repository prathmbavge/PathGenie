// middlewares/errorHandler.js

import logger from '../utils/logger.js';

/**
 * Middleware function to handle errors.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object} The response object.
 */
const errorHandler = (err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  logger.error(err.stack);

  // Check for duplicate key error (MongoDB)
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const errorMessage = `${field} already exists`;

    return res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
