// File: src/pages/Layout.jsx

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { clearRebalanceState } from '../redux/rebalanceSlice';
import toast from 'react-hot-toast';

const DropdownMenu = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
        {title}
        <svg className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const activeLinkStyle = { color: '#14b8a6' };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearRebalanceState());
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
            
            <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu title="Screeners">
                <NavLink to="/momentum" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Momentum</NavLink>
                <NavLink to="/alpha" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Alpha</NavLink>
              </DropdownMenu>

              <DropdownMenu title="Portfolios">
                <NavLink to="/my-portfolios" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>My Portfolios</NavLink>
                <NavLink to="/portfolios" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Model Portfolios</NavLink>
              </DropdownMenu>

              <NavLink to="/rebalance" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Rebalance</NavLink>

              <div className="w-px h-6 bg-gray-600 mx-2"></div>

              {userInfo ? (
                <>
                  {userInfo.isAdmin && (
                    <NavLink to="/admin" className="text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-bold" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Admin</NavLink>
                  )}
                  <NavLink to="/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Settings</NavLink>
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
