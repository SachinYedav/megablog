import React, { useState, useCallback } from "react";
import { Container, Modal, SEO } from "../components";
import useTheme from "../context/ThemeContext";
import { Shield, Activity, Clock, Bookmark } from "lucide-react";
import authService from "../appwrite/auth";
import appwriteService from "../appwrite/config";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { Query } from "appwrite";

import GeneralTab from "../components/settings/GeneralTab";
import ActivityTab from "../components/settings/ActivityTab";
import ContentListTab from "../components/settings/ContentListTab";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";

export default function Settings() {
  const { themeMode, darkTheme, lightTheme } = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  const toggleTheme = () => (themeMode === "dark" ? lightTheme() : darkTheme());

  // --- GLOBAL ACTIONS ---
  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      await authService.deleteAccount();
      toast.success("Account deleted.");
      dispatch(logout());
      navigate("/", { replace: true });
    } catch (e) { toast.error("Failed to delete account."); }
    finally { 
      setActionLoading(false); 
       setIsDeleteModalOpen(false);
      setModalConfig({ isOpen: false, type: null }); }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      toast.success("Logged out.");
      navigate("/");
    } catch (e) { toast.error("Logout failed."); }
    finally { setModalConfig({ isOpen: false, type: null }); }
  };

  const handleClearHistory = async () => {
      const toastId = toast.loading("Clearing history...");
      setModalConfig({ isOpen: false, type: null });
      const count = await appwriteService.clearUserHistory(userData?.$id);
      
      if(count !== false) {
          toast.success(`Cleared ${count} items!`, { id: toastId });
      } else {
          toast.error("Failed to clear history", { id: toastId });
      }
  };

  const handleRemoveHistoryItem = async (id) => await appwriteService.deleteHistoryItem(id);
  const handleRemoveBookmark = async (id) => await appwriteService.deleteBookmark(id);

  // --- DATA FETCHERS  ---
  const fetchLogs = useCallback(async () => {
    const res = await authService.getUserLogs();
    return res.logs || [];
  }, []);

  const fetchHistory = useCallback(async (page, limit) => {
     if (!userData?.$id) return [];
     
     // 1. Get History List
     const historyList = await appwriteService.getUserHistory(userData.$id, [
        Query.limit(limit),
        Query.offset((page - 1) * limit)
     ]);

     if(!historyList || historyList.documents.length === 0) return [];

     // 2. Fetch Actual Posts
     const historyWithPosts = await Promise.all(historyList.documents.map(async (doc) => {
        try { 
            const cleanPostId = doc.postId?.$id || doc.postId;
            if (!cleanPostId) return null; 
            const post = await appwriteService.getPost(cleanPostId); 
            if (!post) return null; 

            return { 
                ...post, 
                visitedAt: doc.$createdAt, 
                historyId: doc.$id 
            }; 
        } catch (error) { 
            console.error("History Item Error:", error);
            return null; 
        }
     }));

     return historyWithPosts.filter(p => p !== null);
  }, [userData]);

  const fetchBookmarks = useCallback(async (page, limit) => {
     if (!userData?.$id) return [];

     const list = await appwriteService.getBookmarks(userData.$id, [
        Query.limit(limit),
        Query.offset((page - 1) * limit)
     ]);

     if(!list || list.documents.length === 0) return [];

     const posts = await Promise.all(list.documents.map(async (doc) => {
        try { 
            const cleanPostId = doc.postId?.$id || doc.postId;
            if (!cleanPostId) return null;
            const post = await appwriteService.getPost(cleanPostId); 
            if (!post) return null;

            return { 
                ...post, 
                savedAt: doc.$createdAt, 
                bookmarkId: doc.$id 
            }; 
        } catch (error) { 
            console.error("Bookmark Item Error:", error);
            return null; 
        }
     }));

     return posts.filter(p => p !== null);
  }, [userData]);
  
  return (
    <div className="py-8 w-full min-h-screen">
      <SEO title="Settings" />
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
          {[
            { id: "general", icon: Shield, label: "General" },
            { id: "activity", icon: Activity, label: "Activity" },
            { id: "history", icon: Clock, label: "History" },
            { id: "bookmarks", icon: Bookmark, label: "Saved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id ? "border-primary-light text-primary-light" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto min-h-[400px]">
          {activeTab === "general" && (
             <GeneralTab 
                userData={userData} 
                toggleTheme={toggleTheme} 
                themeMode={themeMode} 
                setModalConfig={setModalConfig} 
                onLogout={() => setModalConfig({ isOpen: true, type: "logout" })}
                 onDeleteAccount={() => setIsDeleteModalOpen(true)} 
             />
          )}
          {activeTab === "activity" && <ActivityTab fetchLogs={fetchLogs} />}
          {activeTab === "history" && <ContentListTab type="history" fetchData={fetchHistory} clearAll={() => setModalConfig({ isOpen: true, type: "clear_history" })} removeItem={handleRemoveHistoryItem} />}
          {activeTab === "bookmarks" && <ContentListTab type="bookmarks" fetchData={fetchBookmarks} removeItem={handleRemoveBookmark} />}
        </div>

       {/* Global Modal Handling */}
      <Modal
  isOpen={modalConfig.isOpen}
  onClose={() => setModalConfig({ isOpen: false, type: null })}
  title={modalConfig.type === "logout" ? "Confirm Logout" : "Clear History?"}
  actionLabel="Confirm"
  onAction={modalConfig.type === "logout" ? handleLogout : handleClearHistory}
  isDanger={modalConfig.type !== "logout"}   // optional
  loading={actionLoading}
  confirmationText={null}
>
  <p className="text-gray-600 dark:text-gray-300">
    Are you sure you want to proceed?
  </p>
</Modal>

      <DeleteAccountModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDeleteAccount}
  loading={actionLoading}
/>
      </Container>
    </div>
  );
}