import crypto from 'crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import sendVerificationEmail from '../../utils/nodemailer.js';
import axios from 'axios';

/**
 * Verifies the CAPTCHA token with Google's reCAPTCHA API.
 *
 * @param {string} token - The CAPTCHA token to verify.
 * @returns {Promise<boolean>} - Returns true if CAPTCHA is valid, otherwise false.
 */
const verifyCaptcha = async (token) => {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${token}`
  );
  return response.data.success;
};

/**
 * Handles the forgot password functionality.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @throws {ApiError} If the CAPTCHA is invalid, user is not found, user is not verified, or if the user has recently requested a password reset.
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, captchaToken } = req.body;

  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    throw new ApiError(400, 'Invalid CAPTCHA');
  }

  // Check if user exists
  // const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found 🥲');
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw new ApiError(400, 'Please verify your email first');
  }

  if (user.resetPasswordToken && Date.now() < user.resetPasswordExpiry) {
    throw new ApiError(
      400,
      'Please wait for 5 minutes before resetting your password again'
    );
  }

  // Generate a reset token and set expiry time (e.g., 5 minutes)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = expiryTime;
  await user.save();

  // Send reset password email
  sendVerificationEmail(email, resetToken, true);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'Password reset link sent to your email and it is valid for 5 minutes'
      )
    );
});
