// File: src/api/alertApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Sends a test notification to the user's linked Telegram account.
 * @param {string} token - The user's JWT for authorization.
 * @returns {Promise<object>} A promise that resolves to the success message.
 */
export const sendTestAlert = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const { data } = await apiClient.post('/alerts/test-notification', {}, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send test notification.');
  }
};
