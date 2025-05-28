// backend/utils/nodemailer.js
import nodemailer from 'nodemailer';
import constants from '../constants.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service
  auth: {
    user: 'omiiiswami2005@gmail.com',
    pass: 'ondu udud dyvs rpze',
  },
});
/**
 * Sends a verification email to the specified email address.
 *
 * @param {string} email - The email address to send the verification email to.
 * @param {string} token - The verification token to include in the email link.
 * @param {boolean} isPassword - Indicates whether the email is for password reset or not.
 * @return {Promise<void>} A promise that resolves when the email is sent successfully.
 */
const sendVerificationEmail = (email, isPassword, url) => {
  const htmlVerification = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f7f7f7;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px;
          background-color: #4CAF50;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
        }
        .content {
          padding: 20px;
        }
        .content p {
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: black;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f1f1f1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello there, Greetings from PathGenie!</p>
          <p>Thank you for registering with us. Please verify your email by clicking the button below:</p>
          <a href="${url}" class="button">Verify Email</a>
          <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
          <p>${url}</p>
        </div>
        <div class="footer">
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>`;

  const htmlPasswordReset = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f7f7f7;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px;
          background-color: #4CAF50;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
        }
        .content {
          padding: 20px;
        }
        .content p {
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: black;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f1f1f1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello there!</p>
          <p>We received a request to reset your password. Please click the button below to reset your password:</p>
          <a href="${constants.clientUrl}/reset-password?token=${token}" class="button">Reset Password</a>
          <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
          <p>${constants.clientUrl}/reset-password?token=${token}</p>
        </div>
        <div class="footer">
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>`;

  const htmlContent = isPassword ? htmlPasswordReset : htmlVerification;
  const subject = isPassword ? 'Password Reset' : 'Email Verification';

  const mailOptions = {
    from: 'omiiiswami2005@gmail.com',
    to: email,
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
