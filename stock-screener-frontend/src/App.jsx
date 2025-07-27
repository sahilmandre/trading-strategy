// File: src/App.jsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
  // By wrapping the RouterProvider, the RebalanceContext state
  // will be available to all pages and persist during navigation.
  return (

    <RouterProvider router={router} />

  );
}

export default App;
