import React, { useState, useEffect, useRef, useCallback } from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoreVertical, Share2, Flag, Star, BadgeCheck } from "lucide-react"; 
import toast from "react-hot-toast";
import { ShareModal, ReportModal } from "./index";

function PostCard({
  $id,
  title,
  featuredImage,
  authorName,
  authorId,
  userId,
  authorAvatarId,
  $createdAt,
  createdAt,
  views,
  onDelete,
  isPinned = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [liveAuthor, setLiveAuthor] = useState({
    name: authorName || "Anonymous",
    avatar: authorAvatarId || null,
    isPro: false,
  });

  const realAuthorId = authorId || userId;
  const menuRef = useRef(null);
  const userData = useSelector((state) => state.auth.userData);

  const displayViews = views ? parseInt(views).toLocaleString() : "0";

  const fetchLiveProfile = useCallback(async () => {
    if (!realAuthorId) return;
    try {
      const profile = await appwriteService.getUserProfile(realAuthorId);
      if (profile) {
        setLiveAuthor({
          name: profile.name,
          avatar: profile.avatarId,
          isPro: profile.isPro || false, 
        });
      }
    } catch (error) {}
  }, [realAuthorId]);

  useEffect(() => {
    fetchLiveProfile();
  }, [fetchLiveProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days < 30) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleMenuAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (action === "share") setShowShare(true);
    if (action === "report") {
      if (!userData) return toast.error("Login required");
      setShowReport(true);
    }
    if (action === "delete" && onDelete) onDelete($id);
  };

  const handleReportSubmit = async (reason) => {
    // 1. Login Check
    if (!userData) {
        toast.error("You must be logged in to report.");
        setShowReport(false);
        return;
    }

    try {
      // 2. API Call (Create Report)
      await appwriteService.createReport({
        reporterId: userData.$id,
        targetId: $id,      
        targetType: "post",  
        reason: reason,
      });

      toast.success("Report submitted successfully");
    } catch (error) {
      console.error("Report Error:", error);
      toast.error("Failed to submit report");
    } finally {
      setShowReport(false); 
    }
  };

  return (
    <>
      <Link to={`/post/${$id}`} className="block h-full relative group">
        {/* Pinned Glow Effect */}
        {isPinned && (
          <div className="absolute -inset-[2px] bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400 rounded-2xl opacity-75 blur-sm animate-pulse"></div>
        )}

        <div
          className={`relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl p-3 border transition-all duration-300 flex flex-col 
          ${
            isPinned
              ? "border-yellow-400/50 dark:border-yellow-500/50"
              : "border-gray-200 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-gray-800/50"
          }`}
        >
          {/* Thumbnail */}
          <div className="w-full aspect-video mb-3 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* PIN BADGE (Top Left) */}
            {isPinned && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                <Star size={12} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Featured
                </span>
              </div>
            )}

            {/*  PRO BADGE (Top Right) */}
            {liveAuthor.isPro && (
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-yellow-500/50 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-lg z-10 tracking-widest">
                PRO
              </div>
            )}

            {featuredImage && !imgError ? (
              <img
                src={appwriteService.getFilePreview(featuredImage)}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex gap-3 items-start px-1">
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1 relative">
              {liveAuthor.avatar ? (
                <img
                  src={appwriteService.getFilePreview(liveAuthor.avatar)}
                  alt={liveAuthor.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {liveAuthor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {title}
                </h2>

                {/* Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 "
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-lg z-50 py-1 animate-in zoom-in-95">
                      <button
                        onClick={(e) => handleMenuAction(e, "share")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <Share2 size={14} /> Share
                      </button>
                      {userData && userData.$id !== realAuthorId && (
                        <button
                          onClick={(e) => handleMenuAction(e, "report")}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                        >
                          <Flag size={14} /> Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AUTHOR NAME WITH VERIFIED TICK */}
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span>{liveAuthor.name}</span>
                {liveAuthor.isPro && (
                  <BadgeCheck
                    size={14}
                    className="text-blue-500 fill-blue-50 dark:text-blue-400 dark:fill-blue-900/30"
                  />
                )}
              </div>

              <div className="text-xs text-gray-500 mt-0.5">
                {displayViews} views • {timeAgo($createdAt || createdAt)}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Modals */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          title={title}
          url={`${window.location.origin}/post/${$id}`}
        />
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          onSubmit={handleReportSubmit}
        />
      </div>
    </>
  );
}

export default PostCard;
