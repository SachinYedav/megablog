import React from "react";

const WifiOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const WifiOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const NetworkStatusBar = ({ isOnline, show }) => {
  if (isOnline && !show) return null;

  return (
    <div
      className={`
        fixed z-[100000] 
        left-4 right-4 md:left-6 md:right-auto md:w-auto
        bottom-20 md:bottom-6 
        flex items-center gap-3 px-4 py-3 
        rounded-lg shadow-2xl
        transition-all duration-500 ease-in-out transform
        ${!isOnline || show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}

        /* 👇 COLOR LOGIC: Offline = Red, Online = Green */
        ${!isOnline 
            ? "bg-red-600 border border-red-700" 
            : "bg-green-600 border border-green-700"
        }
      `}
    >
      {/* Icons */}
      {!isOnline ? <WifiOffIcon /> : <WifiOnIcon />}
      
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-wide">
          {!isOnline ? "No internet connection" : "Back online"}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatusBar;