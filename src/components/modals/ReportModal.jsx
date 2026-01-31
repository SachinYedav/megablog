import React, { useState, useId } from "react";
import { Modal } from "../index"; 

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("Spam");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uniqueId = useId();

 const handleSubmit = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    if (isSubmitting) return;

    setIsSubmitting(true);  

    const finalReason = reason === "Other" ? customReason : reason;
    
    try {
        await onSubmit(finalReason); 
    } finally {
        setIsSubmitting(false); 
        setReason("Spam");
        setCustomReason("");
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Content"
      actionLabel={isSubmitting ? "Reporting..." : "Report"}
      onAction={handleSubmit}
      loading={isSubmitting}
      isDanger={false}
    >
      <div className="space-y-3 py-2">
        {[
          "Spam or misleading",
          "Harassment or bullying",
          "Hate speech",
          "Violent content",
          "Other",
        ].map((r) => (
          <label
            key={r}
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
          >
            <input
              type="radio"
              name={`reportReason-${uniqueId}`}
              value={r}
              checked={reason === r}
              onChange={(e) => setReason(e.target.value)}
              className="w-5 h-5 text-blue-600 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {r}
            </span>
          </label>
        ))}
        {reason === "Other" && (
          <textarea
            className="w-full border rounded-xl p-3 text-sm mt-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
            placeholder="Please describe..."
            rows="3"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          ></textarea>
        )}
      </div>
    </Modal>
  );
};

export default ReportModal;

 