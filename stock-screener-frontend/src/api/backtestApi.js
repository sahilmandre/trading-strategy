// File: src/api/backtestApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches backtested performance data for a given set of tickers and a time period.
 * @param {string[]} tickers - An array of stock tickers.
 * @param {string} period - The backtesting period (e.g., '3m', '6m', '1y').
 * @returns {Promise<Array>} A promise that resolves to an array of historical performance data.
 */
export const getBacktestData = async (tickers, period) => {
  if (!tickers || tickers.length === 0 || !period) {
    return []; // Return empty array if inputs are invalid
  }

  try {
    const tickerString = tickers.join(',');
    const { data } = await apiClient.get(`/backtest?tickers=${tickerString}&period=${period}`);
    return data.data;
  } catch (error) {
    console.error(`Error fetching backtest data for period ${period}:`, error);
    throw new Error('Failed to fetch backtest data.');
  }
};
