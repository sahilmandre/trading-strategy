// File: controllers/benchmarkController.js

import yahooFinance from 'yahoo-finance2';

/**
 * Fetches one year of historical data for a given benchmark index ticker.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getBenchmarkData = async (req, res) => {
  // --- FIX: Get ticker from query parameter for robustness ---
  const { ticker } = req.query; 

  if (!ticker) {
    return res.status(400).json({ success: false, message: 'Ticker query parameter is required.' });
  }

  console.log(`Fetching historical data for benchmark: ${ticker}`);

  try {
    const today = new Date();
    const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

    const historicalData = await yahooFinance.historical(ticker, {
      period1: oneYearAgo,
      period2: today,
    });

    res.status(200).json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error(`[benchmarkController] Error fetching data for ${ticker}: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `An internal server error occurred while fetching data for ${ticker}.`,
    });
  }
};
