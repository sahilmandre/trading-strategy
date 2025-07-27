// File: src/api/portfoliosApi.js

import axios from 'axios';

// Get the base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a central Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches the latest model portfolios (Momentum & Alpha) from the backend.
 * @returns {Promise<Object>} A promise that resolves to an object containing the momentum and alpha portfolios.
 */
export const getModelPortfolios = async () => {
  try {
    const { data } = await apiClient.get('/portfolios');
    // The backend response has a 'data' property containing an object with 'momentum' and 'alpha' keys
    return data.data;
  } catch (error) {
    console.error("Error fetching model portfolios:", error);
    // Re-throw the error so React Query can handle it
    throw new Error('Failed to fetch model portfolios.');
  }
};
