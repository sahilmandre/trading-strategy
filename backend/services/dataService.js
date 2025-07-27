// File: services/dataService.js

import yahooFinance from 'yahoo-finance2';

/**
 * Fetches quote data for a list of stock tickers.
 * This includes information like price, company name, and key statistics.
 *
 * @param {string[]} tickers - An array of stock tickers (e.g., ["RELIANCE.NS", "TCS.NS"]).
 * @returns {Promise<object[]>} A promise that resolves to an array of quote data objects.
 */
export const fetchQuoteData = async (tickers) => {
  console.log(`Fetching quote data for: ${tickers.join(', ')}`);
  try {
    // The 'quote' method is efficient for getting summary data for multiple tickers
    const results = await yahooFinance.quote(tickers);

    // It's good practice to ensure the result is always an array
    const quotes = Array.isArray(results) ? results : [results];

    // Log and return the successfully fetched data
    console.log(`Successfully fetched data for ${quotes.length} tickers.`);
    return quotes;

  } catch (error) {
    console.error(`Error fetching quote data from Yahoo Finance: ${error.message}`);
    // In case of a complete failure, we return an empty array to prevent crashes downstream
    return [];
  }
};

/**
 * Fetches historical data for a single stock ticker over a specified period.
 *
 * @param {string} ticker - The stock ticker (e.g., "RELIANCE.NS").
 * @param {string} period - The time period (e.g., '1y' for one year).
 * @returns {Promise<object[]>} A promise that resolves to an array of historical data points.
 */
export const fetchHistoricalData = async (ticker, period = '1y') => {
    // We will implement this function in a later step when we build the analysis service.
    // For now, it's a placeholder to show where our logic will go.
    console.log(`(Placeholder) Fetching ${period} historical data for ${ticker}`);
    return Promise.resolve([]); // Returns an empty array for now
};
