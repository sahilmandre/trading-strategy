// File: routes/rebalanceRoutes.js

import express from 'express';
import {
  getRebalanceState,
  saveRebalanceState,
} from '../controllers/rebalanceController.js';

// Initialize the Express Router
const router = express.Router();

// --- Define API Routes ---

// @route   GET /api/rebalance
// @desc    Get the saved state of the rebalance tool
// @access  Public
router.get('/', getRebalanceState);

// @route   POST /api/rebalance
// @desc    Save the state of the rebalance tool
// @access  Public
router.post('/', saveRebalanceState);


// Export the router so it can be used in our main index.js file
export default router;
