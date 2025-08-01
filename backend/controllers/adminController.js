// File: backend/controllers/adminController.js

import {
  runIntradayStockUpdate,
  runDailyStockUpdate,
  runDailyPerformanceUpdate,
  runMonthlyPortfolioCreation,
} from '../jobs/schedule.js';

/**
 * @desc    Manually trigger the intraday stock update job
 * @route   POST /api/admin/run-intraday-update
 * @access  Admin
 */
export const triggerIntradayUpdate = (req, res) => {
  console.log('[ADMIN] Manual trigger for Intraday Stock Update received.');
  runIntradayStockUpdate(); // Run the job immediately
  res.status(200).json({ success: true, message: 'Intraday stock update job started.' });
};

/**
 * @desc    Manually trigger the daily stock analysis job
 * @route   POST /api/admin/run-daily-analysis
 * @access  Admin
 */
export const triggerDailyAnalysis = (req, res) => {
  console.log('[ADMIN] Manual trigger for Daily Stock Analysis received.');
  runDailyStockUpdate(); // Run the job immediately
  res.status(200).json({ success: true, message: 'Daily stock analysis job started.' });
};

/**
 * @desc    Manually trigger the daily performance update job
 * @route   POST /api/admin/run-performance-update
 * @access  Admin
 */
export const triggerPerformanceUpdate = (req, res) => {
    console.log('[ADMIN] Manual trigger for Daily Performance Update received.');
    runDailyPerformanceUpdate(); // Run the job immediately
    res.status(200).json({ success: true, message: 'Daily performance update job started.' });
};

/**
 * @desc    Manually trigger the monthly portfolio creation job
 * @route   POST /api/admin/run-portfolio-creation
 * @access  Admin
 */
export const triggerPortfolioCreation = (req, res) => {
    console.log('[ADMIN] Manual trigger for Monthly Portfolio Creation received.');
    runMonthlyPortfolioCreation(); // Run the job immediately
    res.status(200).json({ success: true, message: 'Monthly portfolio creation job started.' });
};
