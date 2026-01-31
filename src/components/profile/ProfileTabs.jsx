import React from "react";
import { Edit3, Heart } from "lucide-react"; // Icons import

export default function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
      {/* Tab 1: My Posts */}
      <button
        onClick={() => setActiveTab("myPosts")}
        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative ${
          activeTab === "myPosts"
            ? "text-primary-light"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Edit3 size={16} />
        My Articles
        {/* Active Indicator Line */}
        {activeTab === "myPosts" && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light rounded-t-md animate-in fade-in zoom-in duration-300"></span>
        )}
      </button>

      {/* Tab 2: Liked Posts */}
      <button
        onClick={() => setActiveTab("liked")}
        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative ${
          activeTab === "liked"
            ? "text-red-500" 
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Heart
          size={16}
          className={activeTab === "liked" ? "fill-current" : ""}
        />
        Liked Posts
        {activeTab === "liked" && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-md animate-in fade-in zoom-in duration-300"></span>
        )}
      </button>
    </div>
  );
}
