// File: controllers/stockController.js

import { fetchQuoteData } from '../services/dataService.js';

/**
 * Controller to handle fetching live quote data for a list of tickers.
 * This is used by the Rebalance Table on the frontend.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getQuotes = async (req, res) => {
  // Extract tickers from the query string, e.g., /api/quotes?tickers=RELIANCE.NS,TCS.NS
  const { tickers } = req.query;

  if (!tickers) {
    return res.status(400).json({
      success: false,
      message: 'The "tickers" query parameter is required.',
    });
  }

  // The tickers will be a comma-separated string, so we split it into an array.
  const tickerArray = tickers.split(',');

  try {
    const quoteData = await fetchQuoteData(tickerArray);

    if (!quoteData || quoteData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Could not fetch data for the provided tickers.',
      });
    }

    // Send the successful response back to the client
    res.status(200).json({
      success: true,
      data: quoteData,
    });

  } catch (error) {
    // Generic error handler for any other unexpected issues
    console.error(`[stockController] Error in getQuotes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

/**
 * Placeholder controller for fetching momentum data.
 * We will build out the logic for this in a future step.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getMomentumData = async (req, res) => {
    res.status(200).json({ message: "Momentum analysis endpoint is under construction." });
};

/**
 * Placeholder controller for fetching alpha data.
 * We will build out the logic for this in a future step.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getAlphaData = async (req, res) => {
    res.status(200).json({ message: "Alpha analysis endpoint is under construction." });
};
