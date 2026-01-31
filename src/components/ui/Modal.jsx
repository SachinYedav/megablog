import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actionLabel,
  onAction,
  isDanger = false,
  loading = false,
  confirmationText,
}) {
  const [show, setShow] = useState(isOpen);
  
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setIsConfirmed(false); // Har baar open hone par checkbox reset karein
    } else {
      // Close hone par 200ms wait karein taki animation dikhe
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  const isButtonDisabled = loading || (confirmationText && !isConfirmed);

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-200 ease-in-out
        ${isOpen ? "opacity-100" : "opacity-0"}
      `}
    >
      <div
        className={`
          w-full max-w-md bg-white dark:bg-[#0f1115] 
          rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10
          transform transition-all duration-200 ease-out
          ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}
        `}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isDanger && <AlertTriangle className="text-red-500" size={20} />}
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-gray-600 dark:text-gray-300">
          {children}

          {/* CHECKBOX SECTION (Optional) */}
          {confirmationText && (
            <div className="mt-6 flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 cursor-pointer" onClick={() => !loading && setIsConfirmed(!isConfirmed)}>
              <input
                id="confirm-checkbox"
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                disabled={loading}
                className={`mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer ${
                  isDanger 
                    ? "text-red-600 focus:ring-red-500" 
                    : "text-green-600 focus:ring-green-500"
                }`}
              />
              <label 
                htmlFor="confirm-checkbox" 
                className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none"
              >
                {confirmationText}
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={onAction}
            disabled={isButtonDisabled} 
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-lg flex items-center gap-2 transition-all 
              ${isButtonDisabled ? "opacity-50 cursor-not-allowed shadow-none" : "hover:opacity-90 hover:scale-[1.02]"} 
              ${
                isDanger
                  ? "bg-red-600 shadow-red-500/20"
                  : "bg-green-600 shadow-green-500/20"
              }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Processing..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}