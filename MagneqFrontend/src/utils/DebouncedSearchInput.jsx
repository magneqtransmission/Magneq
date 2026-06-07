import React, { useState, useEffect } from "react";
import useDebounce from "./debounce";

/**
 * DebouncedSearchInput
 * @param {string} value - The input value
 * @param {function} onChange - Called with new value on input change
 * @param {function} onSelect - Called with item when a result is selected
 * @param {string} placeholder - Input placeholder
 * @param {function} searchFn - Async function to fetch results (receives search term)
 * @param {array} results - Array of result items to display
 * @param {function} onFocus - Called when input is focused
 * @param {number} debounceDelay - Debounce delay in ms (default 350)
 */
const DebouncedSearchInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search...",
  searchFn,
  results = [],
  onFocus,
  debounceDelay = 350,
  renderResultItem,
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(results);

  const debouncedValue = useDebounce(internalValue, debounceDelay);

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!debouncedValue) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    searchFn(debouncedValue)
      .then((res) => {
        if (active) setSearchResults(res);
      })
      .catch(() => {
        if (active) setSearchResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedValue, searchFn]);

  return (
    <div className="relative">
      <input
        type="text"
        className="border p-2 rounded w-full"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          onChange && onChange(e);
        }}
        onFocus={onFocus}
      />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">Loading...</div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute left-0 right-0  bg-white dark:bg-gray-800 border mt-1 z-10 max-h-48 overflow-y-auto rounded shadow">
          {searchResults.map((item) => (
            <div
              key={item._id || item.id || JSON.stringify(item)}
              className="cursor-pointer  hover:bg-gray-100 dark:hover:bg-gray-900 p-2"
              onClick={() => onSelect && onSelect(item)}
            >
              {renderResultItem ? renderResultItem(item) : (item.name || item.label || String(item))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebouncedSearchInput; 