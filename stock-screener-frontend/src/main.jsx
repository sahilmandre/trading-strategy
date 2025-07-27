// File: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux'; // Import the Provider from react-redux
import { store } from './redux/store'; // Import the store we created

// Create a new instance of QueryClient
const queryClient = new QueryClient();

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire application with the Redux Provider.
      This makes the Redux store available to any component that needs it.
    */}
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
