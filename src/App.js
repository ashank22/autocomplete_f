import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchBar.css'; 


const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null); // Ref for debounce timer

  useEffect(() => {
    const handleArrowKeyPress = (event) => {
      if (!showSuggestions || !suggestions.length) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex(prevIndex => Math.max(prevIndex - 1, -1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex(prevIndex => Math.min(prevIndex + 1, suggestions.length - 1));
      }
    };

    window.addEventListener('keydown', handleArrowKeyPress);

    return () => {
      window.removeEventListener('keydown', handleArrowKeyPress);
    };
  }, [showSuggestions, suggestions.length]);

  useEffect(() => {
    if (highlightedIndex !== -1 && suggestions[highlightedIndex]) {
      setQuery(suggestions[highlightedIndex].title);
    }
  }, [highlightedIndex, suggestions]);

  useEffect(() => {
    if (highlightedIndex !== -1 && suggestionsRef.current) {
      const highlightedItem = suggestionsRef.current.children[highlightedIndex];
      highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedIndex, suggestions]);

  useEffect(() => {
    if (!query.trim()) {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      setSuggestions([]);
    }
  }, [query]);

  const handleChange = async (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);

    // Clear previous debounce timer
    clearTimeout(debounceTimerRef.current);

    // Start new debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      if (!inputValue.trim()) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/search?term=${inputValue}`);
        setSuggestions(response.data);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
      }
    }, 300); // Adjust the delay as needed
  };

  // Rest of the component remains the same...



  const handleSelectSuggestion = (movieTitle) => {
    setQuery(movieTitle);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current.focus();
  };

  const handleSearch = () => {
    console.log('Searching for:', query);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex !== -1 && suggestions[highlightedIndex]) {
        handleSelectSuggestion(suggestions[highlightedIndex].title);
      } else {
        handleSearch();
      }
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to handle selection of suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="search-container">
      <div className="search-center">
        <input 
          type="text" 
          value={query} 
          onChange={handleChange} 
          onFocus={() => setShowSuggestions(query.trim() !== '')}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Search for movies..." 
          className="search-input"
          ref={inputRef}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
        {showSuggestions && (
          <ul className="suggestions-list" ref={suggestionsRef}>
            {suggestions.map((movie, index) => (
              <li 
                key={index} 
                onClick={() => handleSelectSuggestion(movie.title)} 
                className={highlightedIndex === index ? 'highlighted' : ''}
              >
                {movie.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


export default SearchBar;
