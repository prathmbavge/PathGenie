/**
 * Configuration module for the server.
 * Contains various configurations for the server application.
 * @module config
 */

// Importing dotenv module for environment variable loading
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration object for the server application.
 * @constant
 * @type {Object}
 * @property {number} port - The port number on which the server will run. Defaults to 3000.
 * @property {Object} db - Configuration for the database connection.
 * @property {string} db.uri - The URI for the database connection.
 */
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

