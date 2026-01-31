import React from "react";
import { calculateLevel, calculateProgress } from "../utils/gamification";
import { Lock, Crown, Sparkles, Trophy } from "lucide-react"; 

function UserProgress({ postCount, followerCount }) {
  const { currentLevel, nextLevel } = calculateLevel(postCount, followerCount);
  const progress = calculateProgress(postCount, followerCount, nextLevel);
  const Icon = currentLevel.icon;

  return (
    <div className="w-full mb-8">
      {nextLevel ? (
        // --- STANDARD PROGRESS CARD ---
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Current Rank
              </h3>
              <p className="text-sm text-gray-500">
                Keep writing to unlock rewards!
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${currentLevel.bgColor} ${currentLevel.color} font-bold shadow-sm`}
            >
              <Icon size={20} />
              {currentLevel.label}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase">
              <span>Progress to {nextLevel.label}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${currentLevel.progressColor}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>
                {postCount} / {nextLevel.minPosts} Posts
              </span>
              <span>
                {followerCount} / {nextLevel.minFollowers} Followers
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <Lock size={12} />
            <span>Next Unlock: </span>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {nextLevel.label} Badge{" "}
            </span>
            {nextLevel.isVerified && (
              <span className="text-blue-500">& Verified Tick</span>
            )}
            {nextLevel.isPro && (
              <span className="text-yellow-500">& PRO Status</span>
            )}
          </div>
        </div>
      ) : (
        // ---  MAX LEVEL LEGEND CARD  ---
        <div className="relative group overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-xl shadow-orange-500/20">
          {/* Animated Background Blur */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 text-center flex flex-col items-center">
            {/* Floating Icons Animation */}
            <div className="absolute top-4 left-4 animate-bounce delay-100 opacity-50">
              <Sparkles className="text-yellow-400" size={20} />
            </div>
            <div className="absolute bottom-4 right-4 animate-bounce delay-300 opacity-50">
              <Sparkles className="text-orange-400" size={20} />
            </div>

            {/* Main Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Trophy
                size={40}
                className="text-yellow-600 dark:text-yellow-400 drop-shadow-md"
              />
            </div>

            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Ultimate Legend!
            </h3>

            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              You have reached the pinnacle of writing. You are now a verified
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {" "}
                Pro Writer
              </span>{" "}
              on MegaBlog.
            </p>

            <div className="mt-6 flex gap-3">
              <div className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
                Verified ☑️
              </div>
              <div className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center gap-1">
                Gold Tier 👑
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProgress;
