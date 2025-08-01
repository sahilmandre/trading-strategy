// File: src/api/adminApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Manually triggers a backend job.
 * @param {string} jobName - The name of the job to trigger.
 * @param {string} token - The admin user's JWT.
 * @returns {Promise<object>}
 */
export const triggerJob = async (jobName, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const { data } = await apiClient.post(`/admin/run-${jobName}`, {}, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to trigger ${jobName} job.`);
  }
};

/**
 * Fetches all users for the admin panel.
 * @param {string} token - The admin user's JWT.
 * @returns {Promise<Array>}
 */
export const getAllUsers = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const { data } = await apiClient.get('/admin/users', config);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users.');
    }
};

/**
 * Updates a user's admin status.
 * @param {string} userId - The ID of the user to update.
 * @param {boolean} isAdmin - The new admin status.
 * @param {string} token - The admin user's JWT.
 * @returns {Promise<object>}
 */
export const updateUserAdminStatus = async ({ userId, isAdmin, token }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const { data } = await apiClient.put(`/admin/users/${userId}`, { isAdmin }, config);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user.');
    }
};

/**
 * Deletes a user.
 * @param {string} userId - The ID of the user to delete.
 * @param {string} token - The admin user's JWT.
 * @returns {Promise<object>}
 */
export const deleteUser = async ({ userId, token }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const { data } = await apiClient.delete(`/admin/users/${userId}`, config);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user.');
    }
};

/**
 * Broadcasts a message to all linked Telegram users.
 * @param {string} message - The message to broadcast.
 * @param {string} token - The admin user's JWT.
 * @returns {Promise<object>}
 */
export const broadcastMessage = async ({ message, token }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const { data } = await apiClient.post('/admin/broadcast-message', { message }, config);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send broadcast.');
    }
};
