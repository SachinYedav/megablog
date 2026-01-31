import React from "react";
import { Modal } from "../index"; 
import {
  Copy,
  Twitter,
  MessageCircle,
  Facebook,
  Linkedin,
  Mail,
} from "lucide-react";
import { shareToSocial, copyLink } from "../utils/actionUtils"; 
import toast from "react-hot-toast";

const ShareModal = ({ isOpen, onClose, title, url }) => {
  const handleShare = (platform) => {
    const text = `Check out this amazing article: "${title}"`;
    shareToSocial(platform, text, url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Article"
      isDanger={false}
    >
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Social Icons Grid */}
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          {[
            {
              icon: MessageCircle,
              color: "bg-green-500",
              id: "whatsapp",
              name: "WhatsApp",
            },
            {
              icon: Twitter,
              color: "bg-black",
              id: "twitter",
              name: "X / Twitter",
            },
            {
              icon: Linkedin,
              color: "bg-blue-700",
              id: "linkedin",
              name: "LinkedIn",
            },
            {
              icon: Facebook,
              color: "bg-blue-600",
              id: "facebook",
              name: "Facebook",
            },
            {
              icon: Mail,
              color: "bg-red-500",
              id: "email",
              name: "Email",
            },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleShare(s.id)}
              className="flex flex-col items-center gap-2 group transition-all"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 ${s.color} rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 group-active:scale-95 shadow-md`}
              >
                <s.icon size={22} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {s.name}
              </span>
            </button>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-1.5 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">
            {url}
          </span>
          <button
            onClick={() => {
              copyLink(url);
              toast.success("Link copied to clipboard!");
            }}
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-600 transition-all flex items-center gap-2"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
