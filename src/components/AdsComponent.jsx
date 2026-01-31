import React from "react";
import { ExternalLink } from "lucide-react"; 

export default function AdsComponent({ 
  type = "horizontal", 
  className = "", 
  data = null 
}) {
  
  const defaultContent = {
    horizontal: {
      id: "h1",
      text: "Deploy on Appwrite Cloud ☁️",
      sub: "Get $100 credits for new users.",
      cta: "Claim Now",
      link: "https://appwrite.io", 
      bg: "bg-gradient-to-r from-blue-700 to-indigo-800",
    },
    square: {
      id: "s1",
      text: "Learn React Free ⚛️",
      sub: "Zero to Hero in 6 months.",
      cta: "Join Waitlist",
      link: "https://react.dev/reference/react", 
      bg: "bg-gradient-to-br from-emerald-600 to-teal-800",
    },
    vertical: {
      id: "v1",
      text: "Try GitHub Copilot 🤖",
      sub: "Code 10x faster today.",
      cta: "Try Free",
      link: "https://github.com/features/copilot",
      bg: "bg-gradient-to-b from-orange-600 to-red-700",
    },
  };

  const ad = data || defaultContent[type] || defaultContent.horizontal;

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        relative group block overflow-hidden rounded-xl shadow-md 
        border border-gray-100 dark:border-gray-800 
        transition-all duration-300 hover:shadow-xl hover:scale-[1.01]
        ${ad.bg} ${className}
      `}
      aria-label={`Advertisement: ${ad.text}`}
    >
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[9px] uppercase tracking-wider font-semibold text-white/60 bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
          Sponsored
        </span>
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-col items-center justify-center text-center p-5 h-full w-full text-white relative z-0">
        
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <h4 className="font-bold text-xl md:text-2xl drop-shadow-sm leading-tight">
          {ad.text}
        </h4>
        
        <p className="text-sm md:text-base mt-2 text-white/90 font-medium">
          {ad.sub}
        </p>
        
        {/* CTA Button */}
        <div className="mt-4 px-5 py-2 bg-white text-black text-xs md:text-sm font-bold rounded-full shadow-lg group-hover:bg-gray-50 transition-colors flex items-center gap-1">
          {ad.cta || "Learn More"}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </div>
      </div>
      
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-all pointer-events-none"></div>
    </a>
  );
}