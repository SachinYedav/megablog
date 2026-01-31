import React, { useState } from "react";
import { X, Check, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function ImageModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Image URL is required!");
      return;
    }
    try {
      new URL(url);
    } catch (e) {
      setError("Please enter a valid URL (http://...)");
      return;
    }

    onSubmit({ src: url, width, height, alt });
    resetForm();
  };

  const resetForm = () => {
    setUrl("");
    setWidth("");
    setHeight("");
    setAlt("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LinkIcon size={20} className="text-primary-light" /> Insert Image
          </h3>
          <button
            onClick={resetForm}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.png"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-light/50 outline-none transition-all"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {error}
              </p>
            )}
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Text (For SEO)
            </label>
            <input
              type="text"
              placeholder="Description of image..."
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-light/50 outline-none transition-all"
            />
          </div>

          {/* Dimensions (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Width (px/%/auto)
              </label>
              <input
                type="text"
                placeholder="e.g. 100% or 300"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-light/50 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Height (px/auto)
              </label>
              <input
                type="text"
                placeholder="e.g. auto"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-light/50 outline-none text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-primary-light hover:bg-primary-dark rounded-lg shadow-lg shadow-primary-light/20 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Check size={16} /> Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
