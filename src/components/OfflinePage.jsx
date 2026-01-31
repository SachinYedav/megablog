import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./index"; 

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
   <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center animate-in fade-in duration-700">
      
      {/* Icon Container  */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white dark:bg-gray-900 p-6 rounded-full shadow-xl border border-gray-100 dark:border-gray-800">
          <WifiOff size={48} className="text-red-500 dark:text-red-400" />
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
        No Internet Connection
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
        It seems you are offline. Check your Wi-Fi or mobile data and try again to access the latest content.
      </p>

      {/* Action Button */}
      <Button 
        onClick={handleRetry}
        className="px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
      >
        <RefreshCw size={18} /> Retry Connection
      </Button>

    </div>
  );
}