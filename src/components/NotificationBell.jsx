import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, CheckCheck, Loader2, ChevronDown } from "lucide-react";
import appwriteService from "../appwrite/config";
import conf from "../conf/conf";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const userData = useSelector((state) => state.auth.userData);
  const dropdownRef = useRef(null);

  // --- UTILITY: TIME AGO ---
  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return "Expired";
  };

  // --- 1. FETCH & AUTO CLEANUP ---
  const fetchAndCleanupNotifications = async () => {
    if (!userData?.$id) return;
    setLoading(true);
    try {
      // Fetch data (Limit 100)
      const res = await appwriteService.getNotifications(userData.$id, 100);

      if (res) {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const validNotifications = [];
        const expiredIds = [];

        // Client-side Filtering
        res.documents.forEach((note) => {
          const noteDate = new Date(note.$createdAt);
          if (noteDate < sevenDaysAgo) {
            expiredIds.push(note.$id);
          } else {
            validNotifications.push(note);
          }
        });

        setNotifications(validNotifications);
        setUnreadCount(validNotifications.filter((n) => !n.isRead).length);

        // Silent Background Cleanup
        if (expiredIds.length > 0) {
          Promise.all(
            expiredIds.map((id) => appwriteService.deleteNotification(id))
          ).catch((e) => console.log("Cleanup Error", e));
        }
      }
    } catch (error) {
      console.error("Notification Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. REALTIME LISTENER  ---
  useEffect(() => {
    if (!userData?.$id) return;

    // A. Initial Load
    fetchAndCleanupNotifications();

    // B. Subscribe to Database Changes
    const channel = `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteNotificationsCollectionId}.documents`;
    
    const unsubscribe = appwriteService.client.subscribe(channel, (response) => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        const newNotification = response.payload;

        if (newNotification.userId === userData.$id) {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userData]); 

  // --- ACTIONS ---

  const handleRead = async (notification) => {
    setIsOpen(false); 
    if (!notification.isRead) {
      // 1. Optimistic Update 
      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notification.$id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 2. Backend Update
      try {
        await appwriteService.markNotificationRead(notification.$id);
      } catch (error) {
        console.error("Read Error:", error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const unreadNotes = notifications.filter((n) => !n.isRead);
    if (unreadNotes.length === 0) return;

    // 1. Optimistic Update
    const updatedList = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updatedList);
    setUnreadCount(0);

    // 2. Backend Update
    try {
      await Promise.all(
        unreadNotes.map((n) => appwriteService.markNotificationRead(n.$id))
      );
    } catch (error) {
      console.error("Mark All Read Error:", error);
    }
  };

  // --- UI HANDLERS ---
  
  // Outside Click Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!userData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative text-gray-600 dark:text-gray-200 focus:outline-none"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-black animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-20px)] sm:w-80 md:w-96 max-w-100 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 mr-[-25px] sm:mr-0">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              Notifications{" "}
              {loading && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <>
                {notifications.slice(0, visibleCount).map((n) => {
    const targetLink = n.type === 'invite' ? `/edit-post/${n.link.split('/').pop()}` : n.link;
    
    return (
        <Link
            key={n.$id}
            to={targetLink} 
            onClick={() => handleRead(n)}
            className={`relative flex gap-3 p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group ${
                      !n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    {/* Blue Dot for Unread */}
                    {!n.isRead && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-sm"></span>
                    )}

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {n.senderAvatar ? (
                        <img
                          src={appwriteService.getFilePreview(n.senderAvatar)}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {n.senderName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {n.senderName}
                        </span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {n.message}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {timeAgo(n.$createdAt)}
                      </p>
                    </div>

                    {/* Post Thumbnail (If any) */}
                    {n.postImage && (
                      <div className="shrink-0 w-14 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <img
                          src={appwriteService.getFilePreview(n.postImage)}
                          alt="Post"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
            
            {/*  Special Badge for Invites */}
            {n.type === 'invite' && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">
                    INVITE
                </span>
            )}
                  </Link>
    )
})}
                {/* Show More */}
                {notifications.length > visibleCount && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 font-medium"
                  >
                    <ChevronDown size={14} /> Show Previous Notifications
                  </button>
                )}
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <Bell
                  size={40}
                  className="mb-3 text-gray-300 dark:text-gray-700"
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-400">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;