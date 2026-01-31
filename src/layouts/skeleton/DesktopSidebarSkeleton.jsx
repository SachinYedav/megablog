import React from "react";
import Skeleton from "../../components/Skeleton";

export default function DesktopSidebarSkeleton() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Skeleton width="40px" height="40px" circle />
        <Skeleton width="100px" height="20px" className="ml-3" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <Skeleton width="24px" height="24px" circle />
            <Skeleton width="100px" height="16px" />
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-2">
          <Skeleton width="32px" height="32px" circle />
          <div className="space-y-1">
            <Skeleton width="80px" height="12px" />
            <Skeleton width="50px" height="10px" />
          </div>
        </div>
      </div>
    </aside>
  );
}
