// File: src/pages/Rebalance/RebalancePage.jsx

import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getQuotesForTickers } from '../../api/stocksApi';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import TickerSearchInput from './components/TickerSearchInput';
import {
  fetchRebalanceState,
  saveRebalanceStateThunk,
  setTotalAmount,
  addStock,
  removeStock,
  updateStock,
  autoBalanceWeights,
} from '../../redux/rebalanceSlice';

export default function RebalancePage() {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  const { totalAmount, stocks, status } = useSelector((state) => state.rebalance);
  const { userInfo } = useSelector((state) => state.auth); // Get user info

  // Fetch initial state when the component mounts OR when the user logs in
  useEffect(() => {
    if (userInfo) {
    // We check for 'idle' status to prevent refetching if data is already loaded
      if (status === 'idle') {
        dispatch(fetchRebalanceState());
      }
    }
  }, [status, dispatch, userInfo]);

  // Debounced save effect
  useEffect(() => {
    if (status === 'succeeded' && userInfo) { // Only save if logged in
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const savePromise = dispatch(saveRebalanceStateThunk({ totalAmount, stocks }));

        toast.promise(savePromise, {
          loading: 'Auto-saving portfolio...',
          success: 'Portfolio saved!',
          error: 'Error: Could not save.',
        });

      }, 1500);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [totalAmount, stocks, status, dispatch, userInfo]);


  // Data Fetching for Live Prices
  const { mutateAsync: fetchPrices, isPending: isFetchingPrices } = useMutation({
    mutationFn: getQuotesForTickers,
    onSuccess: (data) => {
      data.forEach(quote => {
        const stockToUpdate = stocks.find(s => s.ticker.toUpperCase() === quote.symbol.toUpperCase());
        if (stockToUpdate) {
          dispatch(updateStock({ id: stockToUpdate.id, updates: { price: quote.regularMarketPrice } }));
        }
      });
    },
  });

  const handleFetchPrices = () => {
    const tickers = stocks.map(s => s.ticker).filter(Boolean);
    if (tickers.length > 0) {
      const fetchPromise = fetchPrices(tickers);

      toast.promise(fetchPromise, {
        loading: 'Fetching live prices...',
        success: 'Prices updated!',
        error: (err) => `Error: ${err.message}`,
      });
    } else {
      toast.error("Please add at least one stock ticker.");
    }
  };

  // Intelligent Calculation Effect
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      stocks.forEach(stock => {
        const idealAmount = (totalAmount * (stock.weight / 100));
        const sharesToBuy = stock.price > 0 ? Math.floor(idealAmount / stock.price) : 0;
        const actualAmount = sharesToBuy * stock.price;
        const unusedCash = idealAmount - actualAmount;

          if (stock.amount !== actualAmount || stock.shares !== sharesToBuy) {
            dispatch(updateStock({
              id: stock.id,
              updates: { amount: actualAmount, shares: sharesToBuy, unusedCash: unusedCash },
            }));
          }
        });
    }
  }, [totalAmount, stocks, dispatch]);

  const totals = useMemo(() => {
    const totalWeight = stocks.reduce((sum, s) => sum + parseFloat(s.weight || 0), 0);
    const totalActualInvestment = stocks.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalUnusedCash = stocks.reduce((sum, s) => sum + (s.unusedCash || 0), 0);
    return { totalWeight, totalActualInvestment, totalUnusedCash };
  }, [stocks]);

  if (status === 'loading' || (userInfo && status === 'idle')) {
    return <Loader />;
  }

  return (
    <div>
      <PageHeader
        title="Portfolio Rebalance Tool"
        subtitle="Plan your portfolio, fetch live prices, and see your data saved automatically."
      />

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-grow">
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-300 mb-1">Total Investment Amount (₹)</label>
          <input
            type="number"
            id="totalAmount"
            value={totalAmount}
            onChange={(e) => dispatch(setTotalAmount(Number(e.target.value)))}
            className="bg-gray-900 text-white w-full rounded-md border-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-lg p-2"
          />
        </div>
        <div className="flex items-end gap-2 pt-6">
          <button onClick={() => dispatch(addStock())} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Stock</button>
          <button onClick={() => dispatch(autoBalanceWeights())} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Auto-Balance</button>
          <button onClick={handleFetchPrices} disabled={isFetchingPrices} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
            {isFetchingPrices ? 'Fetching...' : 'Fetch Prices'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weight (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shares to Buy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actual Amount (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unused Cash (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {stocks.map(stock => (
              <tr key={stock.id}>
                <td className="p-2"><TickerSearchInput value={stock.ticker} onChange={(newValue) => dispatch(updateStock({ id: stock.id, updates: { ticker: newValue } }))} /></td>
                <td className="p-2"><input type="number" value={stock.weight} onChange={(e) => dispatch(updateStock({ id: stock.id, updates: { weight: parseFloat(e.target.value) } }))} className="bg-gray-900 text-white w-24 rounded-md p-2" /></td>
                <td className="p-2 text-gray-300">{stock.price > 0 ? stock.price.toFixed(2) : 'N/A'}</td>
                <td className="p-2 text-teal-400 font-bold">{stock.shares}</td>
                <td className="p-2 text-gray-300 font-semibold">{stock.amount?.toFixed(2)}</td>
                <td className="p-2 text-yellow-500">{stock.unusedCash?.toFixed(2)}</td>
                <td className="p-2"><button onClick={() => dispatch(removeStock(stock.id))} className="text-red-500 hover:text-red-400 font-bold py-2 px-4 rounded-md">Remove</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-700">
            <tr>
              <td className="px-4 py-3 font-bold text-white">Totals</td>
              <td className={`px-4 py-3 font-bold ${totals.totalWeight > 100.1 || totals.totalWeight < 99.9 ? 'text-red-400' : 'text-green-400'}`}>{totals.totalWeight.toFixed(2)}%</td>
              <td colSpan="2"></td>
              <td className="px-4 py-3 font-bold text-white">{totals.totalActualInvestment.toFixed(2)}</td>
              <td className="px-4 py-3 font-bold text-yellow-500">{totals.totalUnusedCash.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
