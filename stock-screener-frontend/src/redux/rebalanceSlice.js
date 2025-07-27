// File: src/redux/rebalanceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRebalanceState, saveRebalanceState } from '../api/rebalanceApi';

// --- Async Thunks for API Calls ---

// 1. Thunk to fetch the initial state from the database
export const fetchRebalanceState = createAsyncThunk(
  'rebalance/fetchState',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getRebalanceState();
      return data;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// 2. Thunk to save the state to the database
export const saveRebalanceStateThunk = createAsyncThunk(
  'rebalance/saveState',
  async (state, { rejectWithValue }) => {
    try {
      // We only need to save totalAmount and stocks
      const saveData = { totalAmount: state.totalAmount, stocks: state.stocks };
      await saveRebalanceState(saveData);
      return saveData;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// --- The Slice Definition ---

const rebalanceSlice = createSlice({
  name: 'rebalance',
  initialState: {
    totalAmount: 100000,
    stocks: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Reducers for synchronous actions (updating state directly)
  reducers: {
    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },
    addStock: (state) => {
      state.stocks.push({ id: Date.now(), ticker: '', weight: 0, price: 0, shares: 0, amount: 0, unusedCash: 0 });
    },
    removeStock: (state, action) => {
      state.stocks = state.stocks.filter(stock => stock.id !== action.payload);
    },
    updateStock: (state, action) => {
      const index = state.stocks.findIndex(stock => stock.id === action.payload.id);
      if (index !== -1) {
        state.stocks[index] = { ...state.stocks[index], ...action.payload.updates };
      }
    },
    autoBalanceWeights: (state) => {
      if (state.stocks.length > 0) {
        const equalWeight = 100 / state.stocks.length;
        state.stocks.forEach(stock => {
          stock.weight = equalWeight;
        });
      }
    },
  },
  // Extra reducers for handling the async thunks
  extraReducers: (builder) => {
    builder
      // Handle fetching state
      .addCase(fetchRebalanceState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRebalanceState.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.totalAmount = action.payload.totalAmount;
        state.stocks = action.payload.stocks;
      })
      .addCase(fetchRebalanceState.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle saving state (we don't need to change state on save, just log)
      .addCase(saveRebalanceStateThunk.fulfilled, () => {
        console.log('✅ Rebalance state saved to DB via Redux Thunk.');
      })
      .addCase(saveRebalanceStateThunk.rejected, (state, action) => {
        console.error('❌ Failed to save rebalance state via Redux Thunk:', action.payload);
      });
  },
});

// Export the actions so our components can use them
export const { setTotalAmount, addStock, removeStock, updateStock, autoBalanceWeights } = rebalanceSlice.actions;

// Export the reducer to be used in our store
export default rebalanceSlice.reducer;
