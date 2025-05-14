import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { config } from 'dotenv';
config();
import { fromNodeHeaders } from "better-auth/node";
import auth from "../lib/auth.js"; // Your Better Auth instance


/**
 * Authentication middleware function.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call.
 * @return {void}
 */
async function authMiddleware(req, res, next) {
  const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

  if (session) {
    // console.log(session);
    req.session = session;
    next();
  } else {
    logger.error('No session found');
    next(new ApiError(401, 'Unauthorized'));
  }
  
}

export default authMiddleware;
