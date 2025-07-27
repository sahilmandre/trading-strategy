// File: src/hooks/useModelPortfolios.js

import { useQuery } from '@tanstack/react-query';
import { getModelPortfolios } from '../api/portfoliosApi';

/**
 * Custom hook to fetch the latest model portfolios data.
 *
 * @returns {object} An object containing the query result:
 * - data: An object with 'momentum' and 'alpha' portfolio properties.
 * - isLoading: A boolean indicating if the data is currently being fetched.
 * - isError: A boolean indicating if an error occurred.
 * - error: The error object if an error occurred.
 */
export const useModelPortfolios = () => {
  return useQuery({
    queryKey: ['modelPortfolios'], // Unique key for this query
    queryFn: getModelPortfolios,   // API function to fetch the data
    staleTime: 1000 * 60 * 60,     // Data is considered fresh for 1 hour
  });
};
