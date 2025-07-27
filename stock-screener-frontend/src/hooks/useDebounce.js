// File: src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 * It will only update the returned value when the input value has not changed for a specified delay.
 * @param {*} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value or delay changes before the timer has fired.
    // This is the core of the debounce logic. If the user is still typing,
    // the old timer is cleared and a new one is set.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run the effect if the value or delay changes

  return debouncedValue;
}
