import React from "react";
import Skeleton from "../../components/Skeleton";

export default function MobileTopBarSkeleton() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton width="32px" height="32px" circle />
        <Skeleton width="90px" height="20px" />
      </div>
      <Skeleton width="36px" height="20px" className="rounded-full" />
    </header>
  );
}
