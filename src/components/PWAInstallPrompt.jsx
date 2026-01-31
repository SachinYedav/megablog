import React, { useState, useEffect } from "react";
import { X, Download, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; 

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      const dismissedTimestamp = localStorage.getItem("pwa-dismissed-timestamp");
      const isDismissed = dismissedTimestamp && (Date.now() - parseInt(dismissedTimestamp) < 86400000); 
      if (!isDismissed) {
          setTimeout(() => setShowPrompt(true), 5000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleRedirect = () => {
    setShowPrompt(false);
    navigate("/download");
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed-timestamp", Date.now().toString());
  };

  if (!showPrompt || location.pathname === "/download") return null;

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img src="/icons/pwa-192x192.png" alt="App" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                    Install MegaBlog App <ShieldCheck className="w-3 h-3 text-blue-500" />
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Faster, Offline & Better Experience
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleClose} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <button onClick={handleRedirect} className="bg-primary-light hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    GET
                </button>
            </div>
        </div>
    </div>
  );
};

export default PWAInstallPrompt;