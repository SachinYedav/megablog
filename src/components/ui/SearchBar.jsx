import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-200 rounded-full bg-gray-50 focus:ring-primary-light focus:border-primary-light dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark outline-none transition-all"
        placeholder="Search for articles, topics..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
