// File: routes/stockRoutes.js

import express from 'express';
import {
  getQuotes,
  getMomentumData,
  getAlphaData,
  searchStocks // <-- Import the new search function
} from '../controllers/stockController.js';

// Initialize the Express Router
const router = express.Router();

// --- Define API Routes ---

// @route   GET /api/stocks/search
// @desc    Search for stocks by ticker or name
// @access  Public
router.get('/search', searchStocks); // <-- Add the new search route

// @route   GET /api/stocks/quotes
// @desc    Get live quote data for a list of tickers
// @access  Public
router.get('/quotes', getQuotes);

// @route   GET /api/stocks/momentum
// @desc    Get momentum data for all Nifty 500 stocks
// @access  Public
router.get('/momentum', getMomentumData);

// @route   GET /api/stocks/alpha
// @desc    Get alpha data for all Nifty 500 stocks
// @access  Public
router.get('/alpha', getAlphaData);


// Export the router so it can be used in our main index.js file
export default router;
