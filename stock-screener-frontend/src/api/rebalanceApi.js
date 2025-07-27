// File: src/api/rebalanceApi.js

import axios from 'axios';

// Get the base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a central Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches the saved rebalance table state from the backend.
 * @returns {Promise<Object>} A promise that resolves to the saved state object.
 */
export const getRebalanceState = async () => {
  console.log('rebalanceApi: Attempting to fetch rebalance state...');
  try {
    const { data } = await apiClient.get('/rebalance');
    console.log('rebalanceApi: Successfully fetched rebalance state:', data);
    return data.data;
  } catch (error) {
    console.error("rebalanceApi: Error fetching rebalance state:", error);
    throw new Error('Failed to fetch rebalance state.');
  }
};

/**
 * Saves the rebalance table state to the backend.
 * @param {object} state - The current state of the rebalance tool to be saved.
 * @returns {Promise<Object>} A promise that resolves to the success response.
 */
export const saveRebalanceState = async (state) => {
  try {
    const { data } = await apiClient.post('/rebalance', state);
    return data;
  } catch (error) {
    console.error("Error saving rebalance state:", error);
    throw new Error('Failed to save rebalance state.');
  }
};

/**
 * Searches for stocks based on a query string.
 * @param {string} query - The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of matching stocks.
 */
export const searchStocks = async (query) => {
    if (!query || query.length < 2) {
        return [];
    }
    try {
        const { data } = await apiClient.get(`/stocks/search?query=${query}`);
        return data.data;
    } catch (error) {
        console.error("Error searching stocks:", error);
        throw new Error('Failed to search stocks.');
    }
}
