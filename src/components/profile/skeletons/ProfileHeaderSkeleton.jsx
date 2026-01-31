import React from "react";
import Skeleton from "../../Skeleton"; 

export default function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-800 mb-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
        <div className="shrink-0">
          <Skeleton circle={true} width="144px" height="144px" className="border-4 border-white dark:border-gray-800" />
        </div>
        <div className="flex-1 w-full flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2 w-full">
              <Skeleton width="60%" height="32px" className="max-w-62.5" />
              <Skeleton width="40%" height="20px" className="max-w-37.5" />
            </div>
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <Skeleton width="120px" height="40px" className="rounded-full" />
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Skeleton width="90%" height="16px" />
            <Skeleton width="75%" height="16px" />
          </div>
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
             <Skeleton width="60px" height="24px" />
             <Skeleton width="80px" height="24px" />
             <Skeleton width="50px" height="24px" />
          </div>
          <div className="flex gap-8 justify-center md:justify-start pt-2">
             <Skeleton width="60px" height="40px" />
             <Skeleton width="60px" height="40px" />
             <Skeleton width="60px" height="40px" />
          </div>
        </div>
      </div>
    </div>
  );
}