import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Loader2 } from "lucide-react"; 
import { Query } from "appwrite";
import { useSelector, useDispatch } from "react-redux";
import { openAuthModal } from "../../store/authSlice";
import appwriteService from "../../appwrite/config";
import conf from "../../conf/conf";
import toast from "react-hot-toast";
import authService from "../../appwrite/auth";
import Skeleton from "../Skeleton"; 

export default function UserListModal({ isOpen, onClose, userId, type, onUpdate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);

  const [myFollowingMap, setMyFollowingMap] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [hoveredButtonId, setHoveredButtonId] = useState(null);

  const currentUser = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setMyFollowingMap({});
      setLastId(null);
      setHasMore(true);
      fetchUsers(true);
    }
  }, [isOpen, type, userId]);

  const fetchUsers = async (isInitial = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const queries = [
        Query.limit(10),
        type === "followers" ? Query.equal("authorId", userId) : Query.equal("subscriberId", userId),
      ];

      if (!isInitial && lastId) queries.push(Query.cursorAfter(lastId));

      const response = await appwriteService.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteSubscriptionsCollectionId, queries);

      if (response.documents.length < 10) setHasMore(false);

      if (response.documents.length > 0) {
        setLastId(response.documents[response.documents.length - 1].$id);

        const targetIds = response.documents.map((doc) =>
          type === "followers" ? doc.subscriberId : doc.authorId
        );

        const profiles = await Promise.all(targetIds.map((id) => appwriteService.getUserProfile(id).catch(() => null)));
        const validProfiles = profiles.filter((p) => p !== null && p.userId !== userId);

        if (currentUser) {
            const newStatusMap = { ...myFollowingMap };
            await Promise.all(validProfiles.map(async (p) => {
                if (p.userId !== currentUser.$id) {
                    try {
                        const sub = await appwriteService.getSubscription(currentUser.$id, p.userId);
                        newStatusMap[p.userId] = !!sub; 
                    } catch {
                        newStatusMap[p.userId] = false;
                    }
                }
            }));
            setMyFollowingMap(prev => ({...prev, ...newStatusMap}));
        }

        setUsers((prev) => isInitial ? validProfiles : [...prev, ...validProfiles]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (targetUser) => {
    if (!currentUser) {
        toast.error("Login required to perform this action", { icon: "🔒", style: { borderRadius: "10px", background: "#333", color: "#fff" } });
        dispatch(openAuthModal("login")); 
        return;
      }
    if (processingIds.has(targetUser.userId)) return;

    const wasFollowing = myFollowingMap[targetUser.userId];
    setMyFollowingMap((prev) => ({ ...prev, [targetUser.userId]: !wasFollowing }));
    setProcessingIds(prev => new Set(prev).add(targetUser.userId));

    try {
      await appwriteService.toggleSubscribe(currentUser.$id, targetUser.userId);

      if (type === "following" && userId === currentUser.$id && wasFollowing) {
          setTimeout(() => setUsers(prev => prev.filter(u => u.userId !== targetUser.userId)), 300);
      }

      if (!wasFollowing) {
          appwriteService.sendNotification({
              type: "follow",
              actorId: currentUser.$id,
              actorName: currentUser.fullName || currentUser.name,
              actorAvatar: currentUser.avatarId || "",
              targetUserId: targetUser.userId, 
              postId: null,
          });
      }
      if (onUpdate) onUpdate();

    } catch (error) {
      setMyFollowingMap((prev) => ({ ...prev, [targetUser.userId]: wasFollowing }));
      toast.error("Action failed");
    } finally {
        setProcessingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(targetUser.userId);
            return newSet;
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col h-[60vh] sm:h-125 border border-gray-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="font-bold text-lg capitalize text-gray-900 dark:text-white flex items-center gap-2">{type}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-0 scroll-smooth">
          {loading && users.length === 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
               {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-4">
                  <Skeleton width="40px" height="40px" circle={true} />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height="14px" />
                    <Skeleton width="30%" height="12px" />
                  </div>
                  <Skeleton width="80px" height="30px" className="rounded-lg" />
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {users.map((user) => {
                const isMe = currentUser && user.userId === currentUser.$id;
                const iFollowThem = myFollowingMap[user.userId];
                const isProcessing = processingIds.has(user.userId);
                const showFollowBack = !iFollowThem && type === 'followers' && userId === currentUser?.$id;

                return (
                  <div key={user.$id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <Link to={`/user/${user.userId}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700">
                        {user.avatarId ? <img src={appwriteService.getFilePreview(user.avatarId)} className="w-full h-full object-cover" alt={user.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">{user.name?.[0]?.toUpperCase()}</div>}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm flex items-center gap-1">{user.name}{user.isPro && <span className="bg-amber-100 text-amber-700 text-[9px] px-1 rounded font-bold">PRO</span>}</h4>
                        <p className="text-xs text-gray-500 truncate">@{user.username || user.name?.toLowerCase().replace(/\s/g, "")}</p>
                      </div>
                    </Link>

                    {!isMe && currentUser && (
                      <button onClick={() => handleToggleFollow(user)} disabled={isProcessing} onMouseEnter={() => setHoveredButtonId(user.userId)} onMouseLeave={() => setHoveredButtonId(null)} className={`ml-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center min-w-22.5 h-8 ${iFollowThem ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600" : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"} ${isProcessing ? "opacity-70 cursor-wait" : ""}`}>
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : iFollowThem ? (hoveredButtonId === user.userId ? "Unfollow" : "Following") : (showFollowBack ? "Follow Back" : "Follow")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 py-10"><p className="text-sm font-medium">No users found.</p></div>
          )}
          
          {hasMore && !loading && users.length > 0 && (
            <div className="p-3 text-center"><button onClick={() => fetchUsers(false)} className="text-xs font-bold text-blue-500 hover:underline">Load More</button></div>
          )}
        </div>
      </div>
    </div>
  );
}