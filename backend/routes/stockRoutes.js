// File: routes/stockRoutes.js

import express from 'express';
import {
  getQuotes,
  getMomentumData,
  getAlphaData,
  searchStocks,
  getStockDetails // <-- Import the new controller function
} from '../controllers/stockController.js';
import { protect } from '../middleware/authMiddleware.js'; // <-- Import protect middleware

const router = express.Router();

// --- Define API Routes ---

// @route   GET /api/stocks/search
router.get('/search', searchStocks);

// @route   GET /api/stocks/quotes
router.get('/quotes', getQuotes);

// @route   GET /api/stocks/momentum
router.get('/momentum', getMomentumData);

// @route   GET /api/stocks/alpha
router.get('/alpha', getAlphaData);

// @route   GET /api/stocks/:ticker
// @desc    Get detailed information for a single stock
// @access  Private
router.get('/:ticker', protect, getStockDetails); // <-- Add the new protected route

export default router;
