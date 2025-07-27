// File: src/App.jsx

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import Layout and Page Components
import Layout from './pages/Layout';
import HomePage from './pages/Home/HomePage';
import MomentumPage from './pages/Momentum/MomentumPage';
import AlphaPage from './pages/Alpha/AlphaPage';
import ModelPortfoliosPage from './pages/ModelPortfolios/ModelPortfoliosPage';
import RebalancePage from './pages/Rebalance/RebalancePage';

// Define the application routes using createBrowserRouter
const router = createBrowserRouter([
  {
    // The parent route uses the Layout component
    path: '/',
    element: <Layout />,
    // Child routes will be rendered inside the Layout's <Outlet>
    children: [
      {
        index: true, // This makes HomePage the default child route for '/'
        element: <HomePage />,
      },
      {
        path: 'momentum',
        element: <MomentumPage />,
      },
      {
        path: 'alpha',
        element: <AlphaPage />,
      },
      {
        path: 'portfolios',
        element: <ModelPortfoliosPage />,
      },
      {
        path: 'rebalance',
        element: <RebalancePage />,
      },
    ],
  },
]);

function App() {
  // The RouterProvider component makes the router available to the app
  return <RouterProvider router={router} />;
}

export default App;
