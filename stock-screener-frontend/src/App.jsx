// File: src/App.jsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Layout and Page Components
import AlphaPage from './pages/Alpha/AlphaPage';
import HomePage from './pages/Home/HomePage';
import Layout from './pages/Layout';
import ModelPortfoliosPage from './pages/ModelPortfolios/ModelPortfoliosPage';
import MomentumPage from './pages/Momentum/MomentumPage';
import RebalancePage from './pages/Rebalance/RebalancePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import PrivateRoute from './components/shared/PrivateRoute';
import StockDetailPage from './pages/StockDetail/StockDetailPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AdminPage from './pages/Admin/AdminPage'; // <-- Import the new Admin page

// Define the application routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // --- Public Routes ---
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // --- Protected Routes ---
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          { path: 'momentum', element: <MomentumPage /> },
          { path: 'alpha', element: <AlphaPage /> },
          { path: 'portfolios', element: <ModelPortfoliosPage /> },
          { path: 'rebalance', element: <RebalancePage /> },
          { path: 'stocks/:ticker', element: <StockDetailPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'admin', element: <AdminPage /> }, // <-- Add the new admin route
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2d3748',
            color: '#e2e8f0',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
