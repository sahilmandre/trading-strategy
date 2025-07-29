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
import PrivateRoute from './components/shared/PrivateRoute'; // <-- Import PrivateRoute
import StockDetailPage from './pages/StockDetail/StockDetailPage';

// Define the application routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // --- Public Routes ---
      // These routes are accessible to everyone.
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // --- Protected Routes ---
      // The PrivateRoute component will check for a logged-in user.
      // If the user is logged in, it will render the nested child route.
      // If not, it will redirect to the /login page.
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          { path: 'momentum', element: <MomentumPage /> },
          { path: 'alpha', element: <AlphaPage /> },
          { path: 'portfolios', element: <ModelPortfoliosPage /> },
          { path: 'rebalance', element: <RebalancePage /> },
          { path: 'stocks/:ticker', element: <StockDetailPage /> },
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
