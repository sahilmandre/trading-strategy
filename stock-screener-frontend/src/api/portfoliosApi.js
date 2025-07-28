// File: src/api/portfoliosApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getModelPortfolios = async () => {
  try {
    const { data } = await apiClient.get('/portfolios');
    return data.data;
  } catch (error) {
    console.error("Error fetching model portfolios:", error);
    throw new Error('Failed to fetch model portfolios.');
  }
};

/**
 * [FIXED] Fetches historical data for a given benchmark index ticker using a query parameter.
 * @param {string} ticker - The ticker for the benchmark index.
 * @returns {Promise<Array>} A promise that resolves to an array of historical data points.
 */
export const getBenchmarkData = async (ticker) => {
  if (!ticker) return [];
  try {
    // --- FIX: Use query parameter for the API call ---
    const { data } = await apiClient.get(
      `/portfolios/benchmark?ticker=${ticker}`
    );
    return data.data;
  } catch (error) {
    console.error(`Error fetching benchmark data for ${ticker}:`, error);
    throw new Error(`Failed to fetch benchmark data for ${ticker}.`);
  }
};
