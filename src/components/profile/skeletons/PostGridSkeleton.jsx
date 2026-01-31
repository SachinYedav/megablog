import React from "react";
import Skeleton from "../../Skeleton"; 

export default function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
      {Array.from({ length: 6 }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full"
        >
          {/* 1. Image Area */}
          <div className="w-full aspect-video relative">
            <Skeleton width="100%" height="100%" className="rounded-none" />
          </div>
          
          {/* 2. Content Area  */}
          <div className="p-4 flex gap-3 items-start">
            
            {/* Left: Avatar Skeleton */}
            <div className="shrink-0">
                <Skeleton width="40px" height="40px" circle={true} />
            </div>

            {/* Right: Text Stack */}
            <div className="flex-1 w-full space-y-2">
                {/* Title Line */}
                <Skeleton width="90%" height="18px" />
                
                {/* Author Name */}
                <Skeleton width="50%" height="14px" />
                
                {/* Views/Date (Meta) */}
                <Skeleton width="30%" height="12px" />
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}