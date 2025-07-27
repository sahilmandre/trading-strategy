// File: controllers/stockController.js

import { fetchQuoteData } from '../services/dataService.js';
// --- Import the new analysis function ---
import { calculateMomentumForAllStocks } from '../services/analysisService.js';

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
 * Controller for fetching and returning momentum data for all stocks.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getMomentumData = async (req, res) => {
    console.log("Received request for /api/stocks/momentum");
    try {
        // Call the analysis service to perform the calculation
        const momentumData = await calculateMomentumForAllStocks();

        res.status(200).json({
            success: true,
            count: momentumData.length,
            data: momentumData,
        });

    } catch (error) {
        console.error(`[stockController] Error in getMomentumData: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred while calculating momentum data.',
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
