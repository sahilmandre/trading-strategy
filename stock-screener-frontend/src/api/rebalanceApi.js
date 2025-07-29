// File: src/api/rebalanceApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches the saved rebalance table state from the backend for the logged-in user.
 * @param {string} token - The user's JWT for authorization.
 * @returns {Promise<Object>} A promise that resolves to the saved state object.
 */
export const getRebalanceState = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await apiClient.get("/rebalance", config);
    return data.data;
  } catch (error) {
    console.error("rebalanceApi: Error fetching rebalance state:", error);
    throw new Error("Failed to fetch rebalance state.");
  }
};

/**
 * Saves the rebalance table state to the backend for the logged-in user.
 * @param {object} state - The current state of the rebalance tool to be saved.
 * @param {string} token - The user's JWT for authorization.
 * @returns {Promise<Object>} A promise that resolves to the success response.
 */
export const saveRebalanceState = async (state, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await apiClient.post("/rebalance", state, config);
    return data;
  } catch (error) {
    console.error("Error saving rebalance state:", error);
    throw new Error("Failed to save rebalance state.");
  }
};

/**
 * Searches for stocks based on a query string. (This remains public, no token needed)
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
