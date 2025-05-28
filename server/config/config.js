/**
 * @fileoverview Configuration module for the server.
 * @description This module contains various configurations for the server application.
 */

// Importing dotenv module for environment variable loading
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration object for the server.
 * @typedef {Object} Config
 * @property {number} port - The port on which the server listens.
 * @property {Object} db - Database configuration.
 * @property {string} db.uri - URI for the MongoDB connection.
 * @property {Object} betterAuth - BetterAuth configuration.
 * @property {Object} betterAuth.github - GitHub OAuth configuration.
 * @property {string} betterAuth.github.clientId - GitHub client ID.
 * @property {string} betterAuth.github.clientSecret - GitHub client secret.
 * @property {Object} betterAuth.google - Google OAuth configuration.
 * @property {string} betterAuth.google.clientId - Google client ID.
 * @property {string} betterAuth.google.clientSecret - Google client secret.
 */

/** @type {Config} */
const config = {
  port: process.env.PORT || 8000,
  db: {
    uri: process.env.MONGODB_URI,
  },
  betterAuth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
  }
};

export default config;

