// File: src/hooks/useAlphaStocks.js

import { useQuery } from '@tanstack/react-query';
import { getAlphaStocks } from '../api/stocksApi';

/**
 * Custom hook to fetch the alpha stocks data.
 * The backend now handles all live price updates and recalculations.
 */
export const useAlphaStocks = () => {
  return useQuery({
    queryKey: ['alphaStocks'], // A single, unique key
    queryFn: getAlphaStocks,   // The API function to call
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
    staleTime: 1000 * 60 * 5,  // Data is considered fresh for 5 minutes
  });
};
