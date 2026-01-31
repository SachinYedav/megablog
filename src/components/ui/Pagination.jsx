import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-12">
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages || totalPages === 0}
        className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}

export default Pagination;
