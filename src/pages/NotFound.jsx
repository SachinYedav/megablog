import React from "react";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components"; 

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center animate-in fade-in duration-700">
      
      {/* Icon Container */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/20 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white dark:bg-gray-900 p-6 rounded-full shadow-xl border border-gray-100 dark:border-gray-800">
          <FileQuestion size={48} className="text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
        Page Not Found
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Go Back (Secondary) */}
        <Button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Go Back
        </Button>

        {/* Home (Primary) */}
        <Link to="/" className="w-full sm:w-auto">
          <Button 
            className="w-full px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Back to Home
          </Button>
        </Link>
      </div>

    </div>
  );
}