import React from "react";
import { X, Eye } from "lucide-react";
import { Button } from "./index";
import ParseHTML from "./RTE/ParseHTML"; 

export default function PostPreviewModal({
  isOpen,
  onClose,
  data,
  imagePreview,
  tags,
  onPublish,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Eye size={18} /> Post Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-black/20">
          <article className="mx-auto">
            {/* Image Preview */}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-8"
              />
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight break-words">
              {data?.title || "Untitled Post"}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full"
                >
                  #{t}
                </span>
              ))}
            </div>

            {data?.content ? (
              <div className="
                  prose dark:prose-invert max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white 
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 
                  prose-a:text-primary-light hover:prose-a:underline 
                  
                  /* Image Safety */
                  prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow-sm
                  [&_img]:max-w-full [&_img]:h-auto

                  /* Video Safety */
                  prose-iframe:w-full prose-iframe:aspect-video prose-iframe:rounded-xl prose-iframe:shadow-md
                  [&_iframe]:max-w-full [&_iframe]:h-auto
              ">
                <ParseHTML content={data.content} />
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Start writing to see content...
              </p>
            )}
          </article>
        </div>

        {/* Footer Actions*/}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 shrink-0">
          <Button
            onClick={onClose}
            bgColor="bg-gray-200 dark:bg-gray-800"
            textColor="text-gray-800 dark:text-white"
          >
            Keep Editing
          </Button>
          <Button onClick={onPublish}>Publish Now</Button>
        </div>
      </div>
    </div>
  );
}