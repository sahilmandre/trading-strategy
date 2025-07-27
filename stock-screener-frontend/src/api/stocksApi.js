// File: src/api/stocksApi.js

import axios from 'axios';

// Get the base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a central Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches the full list of momentum stocks from the backend cache.
 * @returns {Promise<Array>} A promise that resolves to an array of stock data objects.
 */
export const getMomentumStocks = async () => {
  try {
    const { data } = await apiClient.get('/stocks/momentum');
    // Our backend response has a 'data' property containing the array of stocks
    return data.data; 
  } catch (error) {
    console.error("Error fetching momentum stocks:", error);
    // Re-throw the error so React Query can handle it
    throw new Error('Failed to fetch momentum stocks.');
  }
};

/**
 * Fetches the list of alpha-generating stocks from the backend cache.
 * @returns {Promise<Array>} A promise that resolves to an array of stock data objects.
 */
export const getAlphaStocks = async () => {
  try {
    const { data } = await apiClient.get('/stocks/alpha');
    return data.data;
  } catch (error) {
    console.error("Error fetching alpha stocks:", error);
    throw new Error('Failed to fetch alpha stocks.');
  }
};

/**
 * Fetches live quote data for a specific list of tickers.
 * This is used for the Rebalance page.
 * @param {string[]} tickers - An array of stock tickers (e.g., ['RELIANCE.NS', 'TCS.NS']).
 * @returns {Promise<Array>} A promise that resolves to an array of quote data objects.
 */
export const getQuotesForTickers = async (tickers) => {
  // If there are no tickers, return an empty array immediately to avoid a bad request.
  if (!tickers || tickers.length === 0) {
    return [];
  }
  
  try {
    // Join the tickers into a comma-separated string for the query parameter
    const tickerString = tickers.join(',');
    const { data } = await apiClient.get(`/stocks/quotes?tickers=${tickerString}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw new Error('Failed to fetch quotes for tickers.');
  }
};
