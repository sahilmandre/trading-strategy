// File: src/pages/Rebalance/components/TickerSearchInput.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchStocks } from '../../../api/rebalanceApi';
import { useDebounce } from '../../../hooks/useDebounce';

export default function TickerSearchInput({ value, onChange }) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const wrapperRef = useRef(null); // Ref to detect clicks outside the component

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['stockSearch', debouncedSearchTerm],
    queryFn: () => searchStocks(debouncedSearchTerm),
    // Only fetch data if the search term is long enough AND the dropdown is open
    enabled: debouncedSearchTerm.length > 1 && isDropdownOpen,
  });

  // Effect to handle clicks outside the component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // When a stock is selected from the list
  const handleSelect = (ticker) => {
    onChange(ticker);      // Update the parent component's state
    setSearchTerm(ticker); // Update the local input's value
    setIsDropdownOpen(false); // <-- This is the key fix: close the dropdown
  };

  // When the user types in the input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value.toUpperCase());
    if (!isDropdownOpen) {
      setIsDropdownOpen(true); // Open the dropdown when the user starts typing
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownOpen(true)} // Also open on focus for better UX
        placeholder="e.g., RELIANCE"
        className="bg-gray-900 text-white w-full rounded-md p-2"
        autoComplete="off"
      />
      {/* The dropdown is now controlled by isDropdownOpen state */}
      {isDropdownOpen && debouncedSearchTerm.length > 1 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading && <div className="p-2 text-gray-400">Searching...</div>}
          {searchResults && searchResults.length === 0 && !isLoading && (
            <div className="p-2 text-gray-400">No results found.</div>
          )}
          {searchResults && searchResults.length > 0 && (
            <ul>
              {searchResults.map((stock) => (
                <li
                  key={stock.ticker}
                  onClick={() => handleSelect(stock.ticker)}
                  className="p-2 text-white hover:bg-teal-600 cursor-pointer"
                >
                  <span className="font-bold">{stock.ticker}</span> - <span className="text-sm text-gray-300">{stock.longName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
