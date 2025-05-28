/**
 * This is the entry point of the server application.
 * It sets up the application, connects to the database,
 * and starts the server on the specified port.
 *
 * @module index
 */

import app from './app.js';
import connectDB from './db/index.js';
import config from './config/config.js';

const PORT = config.port;

/**
 * Connects to the database and starts the server.
 *
 * @return {Promise<void>} A promise that resolves when the server is started.
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

/**
 * Initializes the server application.
 *
 * @return {void}
 */
const init = () => {
  // Start the server
  startServer();
};

// Initialize the server
init();