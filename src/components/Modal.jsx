import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, children, title }) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    // Overlay
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-200
        ${isOpen ? "opacity-100" : "opacity-0"} 
      `}
    >
      {/* Modal Box */}
      <div
        className={`
          relative w-full max-w-md mx-4
          rounded-xl border shadow-2xl
          transition-all duration-200 ease-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}

          /* Light mode */
          bg-white border-gray-200 text-gray-900

          /* Dark mode */
          dark:bg-[#0f1115] dark:border-white/10 dark:text-white
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              text-gray-400 hover:text-gray-700
              dark:hover:text-white
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;