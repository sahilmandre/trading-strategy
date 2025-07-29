// File: src/pages/Login/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginThunk } from '../../redux/authSlice';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // If the user is already logged in, redirect them to the homepage
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Login" />
      {status === 'failed' && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 text-left">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-900 text-white w-full rounded-md border-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1 text-left">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-900 text-white w-full rounded-md border-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2"
          />
        </div>
        <button type="submit" disabled={status === 'loading'} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
          {status === 'loading' ? <Loader /> : 'Sign In'}
        </button>
        <p className="mt-4 text-center text-gray-400">
          New User? <Link to="/register" className="text-teal-400 hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}
