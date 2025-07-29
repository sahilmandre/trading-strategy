// File: src/api/stocksApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches historical price data for a single stock.
 * @param {string} ticker - The stock ticker.
 * @returns {Promise<Array>} A promise that resolves to an array of historical data.
 */
export const getHistoricalData = async (ticker) => {
  try {
    const { data } = await apiClient.get(
      `/backtest?tickers=${ticker}&period=1y`
    );
    return data.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    throw new Error("Failed to fetch historical data.");
  }
};

// getStockNews function has been removed.

// --- Existing Functions ---

export const getStockDetails = async (ticker, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const { data } = await apiClient.get(`/stocks/${ticker}`, config);
    return data.data;
  } catch (error) {
    console.error(`Error fetching details for ${ticker}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock details."
    );
  }
};

export const getMomentumStocks = async () => {
  try {
    const { data } = await apiClient.get("/stocks/momentum");
    return data.data;
  } catch (error) {
    console.error("Error fetching momentum stocks:", error);
    throw new Error("Failed to fetch momentum stocks.");
  }
};

export const getAlphaStocks = async () => {
  try {
    const { data } = await apiClient.get("/stocks/alpha");
    return data.data;
  } catch (error) {
    console.error("Error fetching alpha stocks:", error);
    throw new Error("Failed to fetch alpha stocks.");
  }
};

export const getQuotesForTickers = async (tickers) => {
  if (!tickers || tickers.length === 0) {
    return [];
  }

  try {
    const tickerString = tickers.join(",");
    const { data } = await apiClient.get(
      `/stocks/quotes?tickers=${tickerString}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw new Error("Failed to fetch quotes for tickers.");
  }
};
