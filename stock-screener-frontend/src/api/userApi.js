// File: src/api/userApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const register = async (userData) => {
  try {
    const { data } = await apiClient.post('/users/register', userData);
    if (data.success && data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed.');
  }
};

export const login = async (userData) => {
  try {
    const { data } = await apiClient.post('/users/login', userData);
    if (data.success && data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed.');
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
};

export const generateTelegramToken = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const { data } = await apiClient.post('/users/telegram-token', {}, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate token.');
  }
};

export const getUserProfile = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const { data } = await apiClient.get('/users/profile', config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
  }
};

export const disconnectTelegram = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const { data } = await apiClient.post('/users/telegram-disconnect', {}, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to disconnect Telegram.');
  }
};
