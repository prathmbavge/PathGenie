// import User from '../../models/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendVerificationEmail from '../../utils/nodemailer.js';
import crypto from 'crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import { config } from 'dotenv';
config();
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';

/**
 * Reset the password of a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {ApiError} If the token is invalid or expired.
 * @return {Promise} A promise that resolves when the password is reset.
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Find user by token and check if token is expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired token 😓');
  }

  // Hash new password and save
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successful 🎉'));
});
