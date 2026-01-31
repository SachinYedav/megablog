import React from "react";
import Skeleton from "../../components/Skeleton";

export default function MobileBottomBarSkeleton() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around items-center px-2 pb-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1 w-full pt-2">
          {i === 2 ? (
            <div className="absolute -top-6 p-1.5 bg-gray-50 dark:bg-gray-950 rounded-full">
              <Skeleton width="52px" height="52px" circle />
            </div>
          ) : (
            <>
              <Skeleton width="22px" height="22px" circle />
              <Skeleton width="30px" height="8px" />
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
