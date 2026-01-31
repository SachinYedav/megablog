import React from "react";

export default function Button({
  children,
  type = "button",
  bgColor = "bg-primary-light dark:bg-primary-dark",
  textColor = "text-white",
  className = "",
  disabled = false, 
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${bgColor} ${textColor} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
