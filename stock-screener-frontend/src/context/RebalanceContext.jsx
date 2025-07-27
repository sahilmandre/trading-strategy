// File: src/contexts/RebalanceContext.jsx

import React, { createContext, useContext, useState, useReducer } from 'react';

// Create the context
const RebalanceContext = createContext();

// Define the initial state for our reducer
const initialState = {
  totalAmount: 100000, // Default investment amount
  stocks: [{ id: 1, ticker: 'RELIANCE.NS', weight: 50, price: 0, shares: 0, amount: 50000 }],
};

// The reducer function handles all state updates
function rebalanceReducer(state, action) {
  switch (action.type) {
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };
    case 'ADD_STOCK':
      const newStock = { id: Date.now(), ticker: '', weight: 0, price: 0, shares: 0, amount: 0 };
      return { ...state, stocks: [...state.stocks, newStock] };
    case 'REMOVE_STOCK':
      return { ...state, stocks: state.stocks.filter(stock => stock.id !== action.payload) };
    case 'UPDATE_STOCK':
      return {
        ...state,
        stocks: state.stocks.map(stock =>
          stock.id === action.payload.id ? { ...stock, ...action.payload.updates } : stock
        ),
      };
    case 'AUTO_BALANCE_WEIGHTS':
        const equalWeight = 100 / state.stocks.length;
        return {
            ...state,
            stocks: state.stocks.map(stock => ({ ...stock, weight: equalWeight }))
        };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// The provider component that will wrap our Rebalance page
export function RebalanceProvider({ children }) {
  const [state, dispatch] = useReducer(rebalanceReducer, initialState);

  const value = { state, dispatch };

  return <RebalanceContext.Provider value={value}>{children}</RebalanceContext.Provider>;
}

// A custom hook to easily access the context's state and dispatch function
export function useRebalance() {
  const context = useContext(RebalanceContext);
  if (context === undefined) {
    throw new Error('useRebalance must be used within a RebalanceProvider');
  }
  return context;
}
