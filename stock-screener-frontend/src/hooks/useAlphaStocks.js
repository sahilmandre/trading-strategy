// File: src/hooks/useAlphaStocks.js

import { useQuery } from '@tanstack/react-query';
import { getAlphaStocks } from '../api/stocksApi';

/**
 * Custom hook to fetch the alpha stocks data.
 * It encapsulates the data fetching logic, caching, and state management.
 *
 * @returns {object} An object containing the query result:
 * - data: The array of alpha-generating stocks.
 * - isLoading: A boolean indicating if the data is currently being fetched.
 * - isError: A boolean indicating if an error occurred.
 * - error: The error object if an error occurred.
 */
export const useAlphaStocks = () => {
  return useQuery({
    queryKey: ['alphaStocks'], // A unique key for this query.
    queryFn: getAlphaStocks,   // The API function to call.
    staleTime: 1000 * 60 * 5,  // Data is considered fresh for 5 minutes.
  });
};
