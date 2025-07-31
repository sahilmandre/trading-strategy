// File: backend/routes/userRoutes.js

import express from 'express';
import {
    registerUser,
    loginUser,
    generateTelegramLinkToken // <-- Import the new controller
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js'; // <-- Import middleware

const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);

// @route   POST /api/users/login
router.post('/login', loginUser);

// @route   POST /api/users/telegram-token
// @desc    Generate a token for linking telegram
// @access  Private
router.post('/telegram-token', protect, generateTelegramLinkToken); // <-- Add the new protected route

export default router;