import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ArrowUpLeft, Sparkles, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import appwriteService from "../appwrite/config";
import useDebounce from "../hooks/useDebounce";

export default function SearchBox({ onSearch, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  const lastSentQuery = useRef(initialValue);
  
  const userData = useSelector((state) => state.auth.userData);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery !== lastSentQuery.current) {
        lastSentQuery.current = debouncedQuery;
        onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]); 

  // ========================================================
  // DATA FETCHING
  // ========================================================
  useEffect(() => {
    if (!isFocused && !showDropdown) return;

    const fetchData = async () => {
      // A. Fetch History (Empty Query)
      if (!debouncedQuery && userData) {
        try {
          const res = await appwriteService.getSearchHistory(userData.$id);
          if (res && res.documents) setHistory(res.documents);
        } catch (e) {
          console.error("History error", e);
        }
        setSuggestions([]);
      } 
      // B. Fetch Suggestions (Typed Query)
      else if (debouncedQuery.trim().length > 1) { // Min 2 chars
        setIsLoading(true);
        try {
          const res = await appwriteService.getSearchSuggestions(debouncedQuery);
          if (res && res.documents) setSuggestions(res.documents);
        } catch (e) {
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
          setSuggestions([]);
      }
    };

    fetchData();
  }, [debouncedQuery, isFocused, showDropdown, userData]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowDropdown(false);
      if (query.trim() && userData) {
        appwriteService.addToSearchHistory(userData.$id, query.trim());
      }
      inputRef.current?.blur();
    }
  };

  const handleSelect = (value) => {
    setQuery(value);
    setShowDropdown(false);
    if (userData) appwriteService.addToSearchHistory(userData.$id, value);
  };

  const handleDeleteHistory = async (e, docId) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.$id !== docId));
    await appwriteService.deleteSearchHistoryItem(docId);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative flex-1 md:w-72 group z-50">
      
      {/* INPUT */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 relative z-50 ${
          isFocused
            ? "bg-white dark:bg-gray-900 border-primary-light ring-4 ring-primary-light/10 shadow-xl"
            : "bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        }`}
      >
        <Search
          size={18}
          className={`transition-colors ${isFocused ? "text-primary-light" : "text-gray-400"}`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search topics, authors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!showDropdown) setShowDropdown(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none w-full text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400"
        />

        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-light border-t-transparent shrink-0" />
        ) : query && (
          <button
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {showDropdown && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-[90vw] md:w-[150%] min-w-[300px] max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[60]"
            style={{ right: "-10px" }}
          >
            {/* HISTORY */}
            {!query && history.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/50 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> Recent
                  </span>
                </div>
                <ul className="py-1">
                  {history.map((item) => (
                    <li
                      key={item.$id}
                      onClick={() => handleSelect(item.query)}
                      className="group/item flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 overflow-hidden">
                        <Clock size={16} className="text-gray-300 group-hover/item:text-primary-light transition-colors shrink-0" />
                        <span className="text-sm font-medium truncate">{item.query}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistory(e, item.$id)}
                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-all shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SUGGESTIONS */}
            {query && (
              <div>
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((post) => (
                      <li
                        key={post.$id}
                        onClick={() => handleSelect(post.title)}
                        className="group/item flex items-center justify-between px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 group-hover/item:text-primary-light transition-all shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate pr-4 group-hover/item:text-primary-light transition-colors"
                              dangerouslySetInnerHTML={{
                                __html: post.title.replace(
                                  new RegExp(`(${query})`, "gi"),
                                  '<span class="text-primary-light font-extrabold">$1</span>'
                                ),
                              }}
                            />
                            <span className="text-[10px] text-gray-400 truncate">
                              by {post.authorName || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <ArrowUpLeft size={14} className="text-gray-300 -rotate-45 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isLoading && (
                    <div className="p-6 text-center text-gray-400">
                      <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No matching results found</p>
                    </div>
                  )
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}