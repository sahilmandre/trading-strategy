// // File: src/hooks/useMomentumStocks.js

// import { useQuery } from '@tanstack/react-query';
// import { getMomentumStocks } from '../api/stocksApi';

// /**
//  * Custom hook to fetch the momentum stocks data.
//  * The backend now handles all live price updates and recalculations.
//  * This hook simply fetches the latest data from the DB cache every 15 minutes.
//  */
// export const useMomentumStocks = () => {
//   return useQuery({
//     queryKey: ['momentumStocks'], // A single, unique key for this data
//     queryFn: getMomentumStocks,   // The API function that gets the latest data from the DB
//     refetchInterval: 1000 * 60 * 15, // Refetch the data every 15 minutes
//     staleTime: 1000 * 60 * 5,     // Data is considered fresh for 5 minutes
//   });
// };

// File: src/hooks/useMomentumStocks.js

import { useQuery } from "@tanstack/react-query";
import { getMomentumStocks } from "../api/stocksApi";

/**
 * Custom hook to fetch the momentum stocks data.
 * The backend now handles all live price updates and recalculations.
 * This hook simply fetches the latest data from the DB cache on a set interval.
 */
export const useMomentumStocks = () => {
  return useQuery({
    queryKey: ["momentumStocks"], // A single, unique key for this data
    queryFn: getMomentumStocks, // The API function that gets the latest data from the DB
    // Refetch the data every 3 minutes for testing purposes.
    // This can be changed to 15 minutes for production.
    refetchInterval: 1000 * 60 * 3,
    staleTime: 1000 * 60 * 1, // Data is considered fresh for 1 minute
  });
};
