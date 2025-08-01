// File: src/api/adminApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Manually triggers a backend job.
 * @param {string} jobName - The name of the job to trigger (e.g., 'intraday-update').
 * @param {string} token - The admin user's JWT for authorization.
 * @returns {Promise<object>} A promise that resolves to the success message.
 */
export const triggerJob = async (jobName, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const { data } = await apiClient.post(`/admin/run-${jobName}`, {}, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to trigger ${jobName} job.`);
  }
};
