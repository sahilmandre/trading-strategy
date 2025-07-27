// File: src/pages/Rebalance/RebalancePage.jsx

import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { RebalanceProvider, useRebalance } from '../../context/RebalanceContext';
import { getQuotesForTickers } from '../../api/stocksApi';
import PageHeader from '../../components/shared/PageHeader';

// The main UI component for the rebalancing tool
function RebalanceTool() {
  const { state, dispatch } = useRebalance();
  const { totalAmount, stocks } = state;

  // --- Data Fetching with React Query ---
  // We use useMutation because we want to fetch data manually on a button click
  const { mutate: fetchPrices, isPending: isFetchingPrices } = useMutation({
    mutationFn: getQuotesForTickers,
    onSuccess: (data) => {
      // When data is successfully fetched, update our state
      data.forEach(quote => {
        const stockToUpdate = stocks.find(s => s.ticker.toUpperCase() === quote.symbol.toUpperCase());
        if (stockToUpdate) {
          dispatch({
            type: 'UPDATE_STOCK',
            payload: { id: stockToUpdate.id, updates: { price: quote.regularMarketPrice } },
          });
        }
      });
    },
    onError: (error) => {
      alert(`Error fetching prices: ${error.message}`);
    }
  });

  // --- Event Handlers ---
  const handleFetchPrices = () => {
    const tickers = stocks.map(s => s.ticker).filter(Boolean); // Get all non-empty tickers
    if (tickers.length > 0) {
      fetchPrices(tickers);
    }
  };

  // --- Calculations ---
  // This effect runs whenever the total amount or any stock's weight/price changes
  useEffect(() => {
    stocks.forEach(stock => {
      const amountToInvest = (totalAmount * (stock.weight / 100));
      const sharesToBuy = stock.price > 0 ? (amountToInvest / stock.price) : 0;

      // Dispatch an update only if the calculated values have changed
      if (stock.amount !== amountToInvest || stock.shares !== sharesToBuy) {
        dispatch({
          type: 'UPDATE_STOCK',
          payload: {
            id: stock.id,
            updates: {
              amount: amountToInvest,
              shares: sharesToBuy,
            },
          },
        });
      }
    });
  }, [totalAmount, stocks, dispatch]);

  const totalWeight = stocks.reduce((sum, s) => sum + parseFloat(s.weight || 0), 0);

  return (
    <div>
      <PageHeader
        title="Portfolio Rebalance Tool"
        subtitle="Plan your portfolio allocation and calculate the number of shares to buy."
      />

      {/* --- Controls --- */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-grow">
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-300 mb-1">Total Investment Amount (₹)</label>
          <input
            type="number"
            id="totalAmount"
            value={totalAmount}
            onChange={(e) => dispatch({ type: 'SET_TOTAL_AMOUNT', payload: Number(e.target.value) })}
            className="bg-gray-900 text-white w-full rounded-md border-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-lg p-2"
          />
        </div>
        <div className="flex items-end gap-2 pt-6">
          <button onClick={() => dispatch({ type: 'ADD_STOCK' })} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Stock</button>
          <button onClick={() => dispatch({ type: 'AUTO_BALANCE_WEIGHTS' })} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Auto-Balance</button>
          <button onClick={handleFetchPrices} disabled={isFetchingPrices} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
            {isFetchingPrices ? 'Fetching...' : 'Fetch Prices'}
          </button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weight (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Price (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount to Invest (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shares to Buy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {stocks.map(stock => (
              <tr key={stock.id}>
                <td className="p-2"><input type="text" value={stock.ticker} onChange={(e) => dispatch({ type: 'UPDATE_STOCK', payload: { id: stock.id, updates: { ticker: e.target.value.toUpperCase() } } })} className="bg-gray-900 text-white w-full rounded-md p-2" /></td>
                <td className="p-2"><input type="number" value={stock.weight} onChange={(e) => dispatch({ type: 'UPDATE_STOCK', payload: { id: stock.id, updates: { weight: parseFloat(e.target.value) } } })} className="bg-gray-900 text-white w-24 rounded-md p-2" /></td>
                <td className="p-2 text-gray-300">{stock.price > 0 ? stock.price.toFixed(2) : 'N/A'}</td>
                <td className="p-2 text-gray-300">{stock.amount.toFixed(2)}</td>
                <td className="p-2 text-teal-400 font-bold">{stock.shares.toFixed(4)}</td>
                <td className="p-2"><button onClick={() => dispatch({ type: 'REMOVE_STOCK', payload: stock.id })} className="text-red-500 hover:text-red-400 font-bold py-2 px-4 rounded-md">Remove</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-700">
            <tr>
              <td className="px-4 py-3 font-bold text-white">Total</td>
              <td className={`px-4 py-3 font-bold ${totalWeight > 100.1 || totalWeight < 99.9 ? 'text-red-400' : 'text-green-400'}`}>{totalWeight.toFixed(2)}%</td>
              <td colSpan="4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// The main page component wraps the tool with its context provider
export default function RebalancePage() {
  return (
    <RebalanceProvider>
      <RebalanceTool />
    </RebalanceProvider>
  );
}
