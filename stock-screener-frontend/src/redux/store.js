// File: src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import rebalanceReducer from './rebalanceSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the reducer from our rebalance slice to the store
    rebalance: rebalanceReducer,
  },
});
