// File: src/hooks/useMomentumStocks.js

import { useQuery } from '@tanstack/react-query';
import { getMomentumStocks } from '../api/stocksApi';

/**
 * Custom hook to fetch the momentum stocks data.
 * It encapsulates the data fetching logic, caching, and state management.
 *
 * @returns {object} An object containing the query result:
 * - data: The array of momentum stocks.
 * - isLoading: A boolean indicating if the data is currently being fetched.
 * - isError: A boolean indicating if an error occurred.
 * - error: The error object if an error occurred.
 */
export const useMomentumStocks = () => {
  return useQuery({
    queryKey: ['momentumStocks'], // A unique key for this query, used for caching.
    queryFn: getMomentumStocks,   // The function that will be called to fetch the data.
    staleTime: 1000 * 60 * 5,     // The data will be considered "fresh" for 5 minutes.
  });
};
