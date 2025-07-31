// File: backend/routes/userRoutes.js

import express from 'express';
import {
    registerUser,
    loginUser,
    generateTelegramLinkToken,
    getUserProfile,
    disconnectTelegram
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/telegram-token', protect, generateTelegramLinkToken);
router.post('/telegram-disconnect', protect, disconnectTelegram);

export default router;
