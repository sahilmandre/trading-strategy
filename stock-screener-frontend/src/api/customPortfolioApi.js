// File: src/api/customPortfolioApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getMyPortfolios = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const { data } = await apiClient.get('/my-portfolios', config);
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch portfolios.');
  }
};

export const createMyPortfolio = async ({ portfolioName, token }) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const { data } = await apiClient.post('/my-portfolios', { portfolioName }, config);
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create portfolio.');
  }
};

/**
 * Fetches all details for a single portfolio, including trades.
 * @param {string} portfolioId - The ID of the portfolio.
 * @param {string} token - The user's JWT.
 * @returns {Promise<object>}
 */
export const getPortfolioDetails = async ({ portfolioId, token }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const { data } = await apiClient.get(`/my-portfolios/${portfolioId}`, config);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch portfolio details.');
    }
};

/**
 * Adds a new trade to a specific portfolio.
 * @param {object} tradeData - Contains portfolioId, ticker, quantity, price, tradeDate.
 * @param {string} token - The user's JWT.
 * @returns {Promise<object>}
 */
export const addTrade = async ({ tradeData, token }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { portfolioId, ...rest } = tradeData;
    try {
        const { data } = await apiClient.post(`/my-portfolios/${portfolioId}/add`, rest, config);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add trade.');
    }
};
