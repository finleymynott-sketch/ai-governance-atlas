import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { getFlagEmoji } from '@/utils/flags';
import type { Country } from '@/types';

/**
 * Search input with dropdown to find and select countries
 * Premium micro-interactions and focus states
 */
export const CountrySearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const countries = useAtlasStore((state) => state.countries);
  const selectCountry = useAtlasStore((state) => state.selectCountry);

  // Filter countries based on query
  const filteredCountries = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.id.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8); // Limit results
  }, [query, countries]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCountries.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCountries.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter': {
        e.preventDefault();
        const selected = filteredCountries[highlightedIndex];
        if (selected) {
          handleSelect(selected);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (country: Country) => {
    selectCountry(country.id);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3" ref={containerRef}>
      <h3 className="section-header">
        Search Countries
      </h3>

      <div className="relative">
        {/* Search input with animated focus ring */}
        <div className="relative">
          {/* Animated focus ring */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{
              boxShadow: isFocused 
                ? '0 0 0 2px var(--accent-primary), 0 0 20px rgba(59, 130, 246, 0.15)'
                : '0 0 0 1px var(--border-subtle)'
            }}
            transition={{ duration: 0.2 }}
          />
          
          <Search
            className={`
              absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
              transition-colors duration-200
              ${isFocused ? 'text-accent-primary' : 'text-text-tertiary'}
            `}
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query) setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name..."
            className="
              w-full h-10 pl-10 pr-10 rounded-lg
              bg-bg-tertiary border-transparent
              text-text-primary text-sm
              placeholder:text-text-tertiary
              outline-none
              transition-colors duration-200
            "
          />
          
          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={clearQuery}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  w-5 h-5 rounded-full
                  bg-border-subtle text-text-secondary
                  hover:bg-border-strong hover:text-text-primary
                  flex items-center justify-center
                  transition-colors duration-200
                  cursor-pointer
                "
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Dropdown - positioned absolutely to float over content */}
        <AnimatePresence>
          {isOpen && filteredCountries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="
                absolute left-0 right-0 mt-1
                bg-bg-elevated border border-border-subtle rounded-lg
                shadow-lg overflow-hidden
              "
              style={{ 
                zIndex: 9999,
                top: '100%',
              }}
            >
              {filteredCountries.map((country, index) => (
                <motion.button
                  key={country.id}
                  onClick={() => handleSelect(country)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    text-left cursor-pointer
                    transition-colors duration-150
                    ${index === highlightedIndex 
                      ? 'bg-bg-tertiary' 
                      : 'hover:bg-bg-secondary'
                    }
                  `}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Flag emoji */}
                  <span className="text-lg">
                    {getFlagEmoji(country.id)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {country.name}
                    </div>
                    <div className="text-xs text-text-tertiary truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {country.region}
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary font-mono bg-bg-tertiary px-1.5 py-0.5 rounded">
                    {country.id}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results message */}
        <AnimatePresence>
          {isOpen && query && filteredCountries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="
                absolute left-0 right-0 mt-1
                bg-bg-elevated border border-border-subtle rounded-lg
                shadow-lg p-4
              "
              style={{ 
                zIndex: 9999,
                top: '100%',
              }}
            >
              <div className="text-center">
                <Search className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-50" />
                <p className="text-sm text-text-secondary">
                  No countries found
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Try a different search term
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
