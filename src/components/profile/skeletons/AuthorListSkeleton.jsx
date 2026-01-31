import React from "react";
import Skeleton from "../../Skeleton"; 

export default function AuthorListSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
          
          {/* Avatar Circle Skeleton */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] border-2 border-gray-100 dark:border-gray-800">
             <Skeleton width="100%" height="100%" circle={true} />
          </div>

          {/* Name Skeleton */}
          <Skeleton width="60px" height="10px" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}