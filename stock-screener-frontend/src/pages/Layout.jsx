// File: src/pages/Layout.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// A simple utility to merge class names, useful for conditional styling.
// In a real project, you would install a library like `clsx`.
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Layout() {
  // Define the style for an active NavLink
  const activeLinkStyle = {
    color: '#14b8a6', // A teal color for the active link
    textDecoration: 'underline',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header Section */}
      <header className="bg-gray-800 shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Site Title */}
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-2xl font-bold text-teal-500 hover:text-teal-400 transition-colors">
                StockScreener
              </NavLink>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/momentum"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  Momentum Screener
                </NavLink>
                <NavLink
                  to="/alpha"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  Alpha Screener
                </NavLink>
                <NavLink
                  to="/portfolios"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  Model Portfolios
                </NavLink>
                <NavLink
                  to="/rebalance"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  Rebalance Tool
                </NavLink>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main>
        {/* The Outlet component renders the matched child route's component */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
