// File: src/components/shared/PrivateRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A component that acts as a gatekeeper for protected routes.
 * It checks if a user is logged in based on the Redux auth state.
 * If the user is logged in, it renders the child route (via <Outlet />).
 * If not, it redirects them to the /login page.
 */
const PrivateRoute = () => {
  // Get the user's login information from the Redux store
  const { userInfo } = useSelector((state) => state.auth);

  // If userInfo exists in the state, the user is logged in.
  // The <Outlet /> component will render the nested child route component.
  // Otherwise, redirect to the login page.
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
