// File: controllers/stockController.js

import { fetchQuoteData } from "../services/dataService.js";
import StockData from "../models/stockDataModel.js";

// --- REFACTORED & SIMPLIFIED CONTROLLERS ---

/**
 * Fetches the latest momentum data directly from the database cache.
 * The data is updated by the scheduled cron jobs.
 */
export const getMomentumData = async (req, res) => {
  console.log(
    "[LOG] Request for Momentum data received. Fetching from DB cache."
  );
  try {
    const momentumData = await StockData.find()
      .sort({ momentumScore: -1 })
      .lean();

    if (!momentumData || momentumData.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No stock data found in cache. The update job may not have run yet.",
      });
    }
    res.status(200).json({
      success: true,
      count: momentumData.length,
      data: momentumData,
    });
  } catch (error) {
    console.error(
      `[stockController] Error in getMomentumData: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Server error fetching momentum data.",
    });
  }
};

/**
 * Fetches the latest alpha data directly from the database cache.
 */
export const getAlphaData = async (req, res) => {
  console.log("[LOG] Request for Alpha data received. Fetching from DB cache.");
  try {
    const alphaData = await StockData.find({ alpha: { $gt: 0 } })
      .sort({ alpha: -1 })
      .lean();

    if (!alphaData || alphaData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No positive alpha stocks found in the cache.",
      });
    }
    res.status(200).json({
      success: true,
      count: alphaData.length,
      data: alphaData,
    });
  } catch (error) {
    console.error(`[stockController] Error in getAlphaData: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error fetching alpha data.",
    });
  }
};

// --- UNCHANGED CONTROLLERS ---
export const getStockDetails = async (req, res) => {
  try {
    const { ticker } = req.params;
    const stock = await StockData.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock with ticker ${ticker} not found in the database cache.`,
      });
    }
    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error(
      `[stockController] Error in getStockDetails: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message:
        "An internal server error occurred while fetching stock details.",
    });
  }
};
export const searchStocks = async (req, res) => {
  const { query } = req.query;
  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }
  try {
    const searchRegex = new RegExp(query, "i");
    const results = await StockData.find({
      $or: [
        { ticker: { $regex: searchRegex } },
        { longName: { $regex: searchRegex } },
      ],
    })
      .limit(10)
      .select("ticker longName");
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(`[stockController] Error in searchStocks: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred during stock search.",
    });
  }
};
export const getQuotes = async (req, res) => {
  const { tickers } = req.query;
  if (!tickers) {
    return res.status(400).json({
      success: false,
      message: 'The "tickers" query parameter is required.',
    });
  }
  console.log(
    `[LOG] Received request to fetch live prices for ${
      tickers.split(",").length
    } tickers.`
  );
  const tickerArray = tickers.split(",");
  try {
    const quoteData = await fetchQuoteData(tickerArray);
    if (!quoteData || quoteData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Could not fetch data for the provided tickers.",
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
      message: "An internal server error occurred.",
    });
  }
};
