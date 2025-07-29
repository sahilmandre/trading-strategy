// File: src/redux/rebalanceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRebalanceState, saveRebalanceState } from '../api/rebalanceApi';

// Define the initial state for this slice
const initialState = {
  totalAmount: 100000,
  stocks: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks for API Calls ---

export const fetchRebalanceState = createAsyncThunk(
  'rebalance/fetchState',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the token from the auth slice
      const { userInfo } = getState().auth;
      const token = userInfo?.token;
      if (!token) {
        return rejectWithValue('No token found');
      }
      const data = await getRebalanceState(token);
      return data;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const saveRebalanceStateThunk = createAsyncThunk(
  'rebalance/saveState',
  async (state, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const token = userInfo?.token;
      if (!token) {
        return rejectWithValue('No token found');
      }
      const saveData = { totalAmount: state.totalAmount, stocks: state.stocks };
      await saveRebalanceState(saveData, token);
      return saveData;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const rebalanceSlice = createSlice({
  name: 'rebalance',
  initialState,
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
    // New reducer to clear the state on logout
    clearRebalanceState: (state) => {
      state.totalAmount = initialState.totalAmount;
      state.stocks = initialState.stocks;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRebalanceState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRebalanceState.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.totalAmount = action.payload.totalAmount;
        // Ensure stocks is always an array
        state.stocks = action.payload.stocks || [];
      })
      .addCase(fetchRebalanceState.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveRebalanceStateThunk.fulfilled, () => {
        console.log('✅ Rebalance state saved to DB via Redux Thunk.');
      })
      .addCase(saveRebalanceStateThunk.rejected, (state, action) => {
        console.error('❌ Failed to save rebalance state via Redux Thunk:', action.payload);
      });
  },
});

export const { setTotalAmount, addStock, removeStock, updateStock, autoBalanceWeights, clearRebalanceState } = rebalanceSlice.actions;

export default rebalanceSlice.reducer;
