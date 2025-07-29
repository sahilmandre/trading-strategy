// File: src/api/userApi.js

import axios from 'axios';

// Get the base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Registers a new user.
 * @param {object} userData - An object containing email and password.
 * @returns {Promise<object>} A promise that resolves to the user object, including a token.
 */
export const register = async (userData) => {
  try {
    const { data } = await apiClient.post('/users/register', userData);
    if (data.success && data.token) {
      // Store user info in local storage on successful registration
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    // Throw the specific error message from the backend if it exists
    throw new Error(error.response?.data?.message || 'Registration failed.');
  }
};

/**
 * Logs in a user.
 * @param {object} userData - An object containing email and password.
 * @returns {Promise<object>} A promise that resolves to the user object, including a token.
 */
export const login = async (userData) => {
  try {
    const { data } = await apiClient.post('/users/login', userData);
    if (data.success && data.token) {
      // Store user info in local storage on successful login
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed.');
  }
};

/**
 * Logs out a user by removing their data from local storage.
 */
export const logout = () => {
  localStorage.removeItem('userInfo');
};
