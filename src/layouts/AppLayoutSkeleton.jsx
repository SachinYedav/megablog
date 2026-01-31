import React from "react";
import { useLocation } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import PostGridSkeleton from "../components/profile/skeletons/PostGridSkeleton";
import DesktopSidebarSkeleton from "./skeleton/DesktopSidebarSkeleton";
import MobileTopBarSkeleton from "./skeleton/MobileTopBarSkeleton";
import MobileBottomBarSkeleton from "./skeleton/MobileBottomBarSkeleton";

export default function AppLayoutSkeleton({ theme = "full" }) {
  const location = useLocation();
  const path = location.pathname;

  // ==========================================
  //  CONTENT LOGIC 
  // ==========================================
  const renderContent = () => {
    //  HOME
    if (path === "/") {
      return (
        <div className="space-y-8 animate-in fade-in">
          <div className="w-full h-[280px] md:h-[320px] rounded-3xl overflow-hidden relative border border-gray-200 dark:border-gray-800">
            <Skeleton width="100%" height="100%" className="rounded-none" />
            <div className="absolute bottom-8 left-6 md:left-10 space-y-4 w-2/3">
              <Skeleton width="80%" height="48px" />
              <div className="flex gap-3 pt-2">
                <Skeleton width="120px" height="44px" className="rounded-xl" />
                <Skeleton width="120px" height="44px" className="rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex gap-6 overflow-hidden pb-2">
            <Skeleton width="100px" height="30px" className="rounded-full" />
            <Skeleton width="100px" height="30px" className="rounded-full" />
          </div>

          <PostGridSkeleton />
        </div>
      );
    }

    //  PROFILE
    if (path.includes("/profile") || path.includes("/user/")) {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div className="w-full bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
            <div className="shrink-0 p-1 bg-white dark:bg-gray-800 rounded-full">
              <Skeleton width="130px" height="130px" circle />
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left w-full mt-2">
              <Skeleton width="200px" height="36px" className="mx-auto md:mx-0" />

              <div className="flex gap-3 justify-center md:justify-start">
                <Skeleton width="80px" height="24px" className="rounded-md" />
                <Skeleton width="80px" height="24px" className="rounded-md" />
              </div>

              <div className="flex justify-center md:justify-start gap-8 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex flex-col gap-1 items-center md:items-start">
                    <Skeleton width="20px" height="24px" />
                    <Skeleton width="60px" height="12px" />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-6 right-6 hidden md:block">
              <Skeleton width="110px" height="40px" className="rounded-xl" />
            </div>
          </div>

          <div className="w-full h-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton width="120px" height="20px" />
              <Skeleton width="60px" height="20px" className="rounded-full" />
            </div>
            <Skeleton width="100%" height="14px" className="rounded-full" />
          </div>

          <PostGridSkeleton />
        </div>
      );
    }

    // SUBSCRIPTIONS
    if (path.includes("/subscriptions")) {
      return (
        <div className="space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center">
            <Skeleton width="180px" height="32px" />
            <Skeleton width="80px" height="28px" className="rounded-full" />
          </div>

          <div className="flex gap-4 overflow-hidden py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="p-1 rounded-full border-2 border-gray-100 dark:border-gray-800">
                  <Skeleton width="70px" height="70px" circle />
                </div>
                <Skeleton width="50px" height="12px" />
              </div>
            ))}
          </div>

          <PostGridSkeleton />
        </div>
      );
    }

    // ADD / EDIT POST
    if (path.includes("/add-post") || path.includes("/edit-post")) {
      return (
        <div className="space-y-6 animate-in fade-in">
          <Skeleton width="200px" height="32px" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton width="100%" height="56px" className="rounded-xl" />
              <Skeleton width="100%" height="450px" className="rounded-xl" />
            </div>

            <div className="space-y-6">
              <div className="h-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
                <Skeleton width="100%" height="100%" className="rounded-lg" />
              </div>
              <Skeleton width="100%" height="120px" className="rounded-xl" />
              <Skeleton width="100%" height="50px" className="rounded-xl" />
            </div>
          </div>
        </div>
      );
    }

    //  HELP PAGE
    if (path.includes("/help")) {
      return (
        <div className="w-full pt-12 md:pt-20 pb-12 animate-in fade-in">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-start mb-10 space-y-3">
              <Skeleton width="280px" height="48px" />
              <Skeleton width="380px" height="20px" />
            </div>

            <div className="flex justify-start mb-10">
              <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width="110px" height="40px" className="rounded-xl" />
                ))}
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <Skeleton width="100%" height="60px" className="rounded-2xl" />

              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    width="100%"
                    height="76px"
                    className="rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // SETTINGS
    if (path.includes("/settings")) {
      return (
        <div className="space-y-8 animate-in fade-in">
          <Skeleton width="160px" height="40px" />

          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width="90px" height="28px" />
            ))}
          </div>

          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full h-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex justify-between items-center"
              >
                <div className="space-y-3">
                  <Skeleton width="140px" height="20px" />
                  <Skeleton width="240px" height="14px" />
                </div>
                <Skeleton width="50px" height="28px" className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // DEFAULT
    return (
      <div className="space-y-6">
        <Skeleton width="200px" height="32px" />
        <PostGridSkeleton />
      </div>
    );
  };

  // ==========================================
  // RENDER STRATEGY
  // ==========================================

  // MODE 1: CONTENT ONLY
  if (theme === "content") {
    return (
      <div className="w-full animate-in fade-in duration-300">
        {renderContent()}
      </div>
    );
  }

  //  MODE 2: FULL LAYOUT
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col md:flex-row">
      <DesktopSidebarSkeleton />
      <MobileTopBarSkeleton />

      <main className="flex-1 w-full pt-20 pb-24 px-4 md:pl-72 md:pt-8 md:pb-8 md:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <MobileBottomBarSkeleton />
    </div>
  );
}
 