import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';
import constants from './constants.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import auth from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import protectedRoutes from './routes/protectedRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Express app
const app = express();
const { morganFormat } = constants;

//Rate limit middleware
const rateLimit = (req, res, next) => {
  const limit = 100; // Limit to 100 requests
  const timeWindow = 15 * 60 * 1000; // 15 minutes

  if (!req.session) {
    req.session = {};
    req.session.requests = [];
  }

  const now = Date.now();
  req.session.requests = req.session.requests.filter(
    (timestamp) => now - timestamp < timeWindow
  );

  if (req.session.requests.length >= limit) {
    return res.status(429).json({ message: 'Too many requests' });
  }

  req.session.requests.push(now);
  next();
};
app.use(rateLimit);

/**
 * Middleware to log requests.
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/**
 * Morgan logger middleware.
 */
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

/**
 * Enable Cross-Origin Resource Sharing.
 */
app.use(
  cors({
    origin: constants?.clientUrl,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    credentials: true,
  })
);

/**
 * Better Auth route handler for /api/auth/*.
 */
app.all('/api/auth/*', toNodeHandler(auth));

/**
 * Parses incoming requests with JSON payloads.
 */
app.use(express.json());

/**
 * Parses incoming requests with URL-encoded payloads.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Parses cookies from the request.
 */
app.use(cookieParser());

/**
 * Parses JSON payloads in the request.
 */
app.use(bodyParser.json());

// Protected routes
app.use('/api', protectedRoutes);

// Middleware to handle errors
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  /**
   * Serve static files from the client build directory.
   */
  app.use(express.static(join(__dirname, '..', 'client', 'dist')));

  /**
   * Serve the index.html file for all other routes.
   */
  app.get('/*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

export default app;