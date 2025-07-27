// File: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Create a new instance of QueryClient.
// This client will manage the caching and state of your server data.
const queryClient = new QueryClient();

// 2. Render the application.
// We wrap the entire App component in the QueryClientProvider.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
