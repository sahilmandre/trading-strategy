// File: src/App.jsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import the Toaster component

// Import Layout and Page Components
import AlphaPage from './pages/Alpha/AlphaPage';
import HomePage from './pages/Home/HomePage';
import Layout from './pages/Layout';
import ModelPortfoliosPage from './pages/ModelPortfolios/ModelPortfoliosPage';
import MomentumPage from './pages/Momentum/MomentumPage';
import RebalancePage from './pages/Rebalance/RebalancePage';

// Define the application routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'momentum', element: <MomentumPage /> },
      { path: 'alpha', element: <AlphaPage /> },
      { path: 'portfolios', element: <ModelPortfoliosPage /> },
      { path: 'rebalance', element: <RebalancePage /> },
    ],
  },
]);

function App() {
  return (
    <>
      {/* The Toaster component renders notifications anywhere in the app.
        We can customize its position and appearance here.
      */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2d3748', // gray-800
            color: '#e2e8f0',     // gray-200
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
