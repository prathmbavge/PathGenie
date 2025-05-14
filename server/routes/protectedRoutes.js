/**
 * This module defines the routes for the protected API endpoints.
 * @module routes/protectedRoutes
 * @imports express
 * @imports middlewares/authMiddleware
 * @imports routes/userRoutes

 */

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import userRoutes from './userRoutes.js';


/**
 * Express Router instance for the protected routes.
 * @type {express.Router}
 */
const router = express.Router();

router.use('/user', authMiddleware, userRoutes);

export default router;

