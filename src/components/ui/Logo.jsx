import React from "react";

function Logo({ width = "100px" }) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      
      <div className="group-hover:scale-105 transition-transform duration-300">
        <img 
            src="/icons/logo.png" 
            alt="MegaBlog Logo"
            
            className="w-12 h-12 object-contain filter drop-shadow-md" 
        />
      </div>
      
      {/* Text Styling */}
      <span className="font-bold text-xl tracking-wide text-gray-800 dark:text-gray-100 font-sans">
        MegaBlog
      </span>
    </div>
  );
}

export default Logo;