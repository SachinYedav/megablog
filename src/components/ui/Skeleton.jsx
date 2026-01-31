import React from "react";

function Skeleton({
  width,
  height,
  className = "",
  circle = false,
  style = {},
}) {
  return (
    <div
      style={{ width, height, ...style }}
      className={`
        relative overflow-hidden isolate
        bg-gray-200/80 
        dark:bg-white/[0.06]
        dark:border dark:border-white/[0.05]
        
        ${circle ? "rounded-full" : "rounded-lg"} 
        ${className}
      `}
    >
      <div 
        className="
          absolute inset-0 -translate-x-full 
          bg-gradient-to-r from-transparent 
          via-white/40 dark:via-white/[0.1] 
          to-transparent 
          animate-[shimmer_1.5s_infinite]
          skew-x-[-20deg] 
        "
      ></div>
    </div>
  );
}

export default Skeleton;