// File: routes/portfolioRoutes.js

import express from 'express';
import { getLatestPortfolios } from '../controllers/portfolioController.js';

// Initialize the Express Router
const router = express.Router();

// --- Define API Routes ---

// @route   GET /api/portfolios
// @desc    Get the latest generated model portfolios for each strategy
// @access  Public
router.get('/', getLatestPortfolios);


// Export the router so it can be used in our main index.js file
export default router;
