// File: controllers/stockController.js

import { fetchQuoteData } from '../services/dataService.js';
// The analysis service is now only used by the scheduled job, not directly by the controller.
// import { calculateMomentumForAllStocks } from '../services/analysisService.js';
import StockData from '../models/stockDataModel.js'; // Import the model to read from the database

/**
 * Controller to handle fetching live quote data for a list of tickers.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getQuotes = async (req, res) => {
  const { tickers } = req.query;

  if (!tickers) {
    return res.status(400).json({
      success: false,
      message: 'The "tickers" query parameter is required.',
    });
  }

  const tickerArray = tickers.split(',');

  try {
    const quoteData = await fetchQuoteData(tickerArray);

    if (!quoteData || quoteData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Could not fetch data for the provided tickers.',
      });
    }

    res.status(200).json({
      success: true,
      data: quoteData,
    });

  } catch (error) {
    console.error(`[stockController] Error in getQuotes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

/**
 * Controller for fetching momentum data from the database cache.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getMomentumData = async (req, res) => {
    console.log("Received request for /api/stocks/momentum - fetching from DB cache.");
    try {
        // Fetch the pre-calculated data from the MongoDB collection.
        // Sort by momentumScore in descending order to get the top performers first.
        const momentumData = await StockData.find().sort({ momentumScore: -1 });

        if (!momentumData || momentumData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No stock data found in cache. The daily update job may not have run yet.'
            });
        }

        res.status(200).json({
            success: true,
            count: momentumData.length,
            data: momentumData,
        });

    } catch (error) {
        console.error(`[stockController] Error in getMomentumData: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while fetching momentum data from cache.',
        });
    }
};

/**
 * Placeholder controller for fetching alpha data.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getAlphaData = async (req, res) => {
    res.status(200).json({ message: "Alpha analysis endpoint is under construction." });
};
