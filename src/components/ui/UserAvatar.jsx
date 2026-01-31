import React, { useState, useEffect } from "react";
import appwriteService from "../../appwrite/config";

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-pink-100 text-pink-600",
  "bg-yellow-100 text-yellow-600",
  "bg-indigo-100 text-indigo-600",
];

export default function UserAvatar({ fileId, name, className = "w-10 h-10" }) {
  //  State to track if image fails to load
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [fileId]);

  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const colorIndex = name ? name.length % COLORS.length : 0;
  const colorClass = COLORS[colorIndex];

  if (fileId && !imgError) {
    return (
      <img
        src={appwriteService.getFilePreview(fileId)}
        alt={name || "User"}
        onError={() => setImgError(true)} 
        className={`${className} rounded-full object-cover border border-gray-200 dark:border-gray-700`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${colorClass} dark:bg-opacity-20`}
    >
      {initial}
    </div>
  );
}