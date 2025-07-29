// File: src/pages/Layout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice'; // <-- CORRECTED PATH
import toast from 'react-hot-toast';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const activeLinkStyle = {
    color: '#14b8a6', // A teal color for the active link
    textDecoration: 'underline',
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-2xl font-bold text-teal-500 hover:text-teal-400 transition-colors">
                StockScreener
              </NavLink>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {/* Main Navigation Links */}
              <NavLink to="/momentum" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Momentum</NavLink>
              <NavLink to="/alpha" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Alpha</NavLink>
              <NavLink to="/portfolios" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Portfolios</NavLink>
              <NavLink to="/rebalance" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Rebalance</NavLink>

              <div className="w-px h-6 bg-gray-600"></div>

              {/* Conditional Auth Links */}
              {userInfo ? (
                <>
                  <span className="text-gray-400 text-sm">Welcome, {userInfo.email}</span>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Login</NavLink>
                  <NavLink to="/register" className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-md text-sm font-medium">Register</NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
