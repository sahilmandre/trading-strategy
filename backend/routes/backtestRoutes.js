// File: routes/backtestRoutes.js

import express from 'express';
import { getBacktestData } from '../controllers/backtestController.js';

const router = express.Router();

// @route   GET /api/backtest
// @desc    Get backtested performance data for a given set of tickers and period
// @access  Public
router.get('/', getBacktestData);

export default router;
