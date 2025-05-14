export default class ApiError extends Error {
  /**
   * Constructor for ApiError class.
   *
   * @param {any} status - The status code of the error.
   * @param {string} message - The error message (default: 'Something went wrong').
   * @param {Array} errors - Array of errors (default: empty).
   * @param {string} stack - The stack trace (default: empty).
   */
  constructor(
    status,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.status = status;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}