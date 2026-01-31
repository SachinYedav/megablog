import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Query } from "appwrite";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { openAuthModal } from "../store/authSlice";

// --- ICONS ---
import { RotateCw, ZoomIn, Check, BarChart2, Grid, Heart, Users } from "lucide-react";

// --- SERVICES & STORE ---
import appwriteService from "../appwrite/config";
import authService from "../appwrite/auth";
import conf from "../conf/conf";
import { updateUserProfile } from "../store/authSlice"; 

// --- COMPONENTS ---
import { Container, Modal, Pagination, SEO } from "../components";
import UserProgress from "../components/ui/UserProgress";

// --- PROFILE SUB-COMPONENTS ---
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileModal from "../components/profile/EditProfileModal";
import PostGrid from "../components/profile/PostGrid";
import AnalyticsTab from "../components/profile/AnalyticsTab";
import UserListModal from "../components/profile/UserListModal";

// --- UTILS ---
import getCroppedImg from "../components/utils/cropImage";
import compressImage from "../components/utils/compress";
import { current } from "@reduxjs/toolkit";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const currentUser = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  //  Determine Identity
  const isOwnProfile = !userId || (currentUser && userId === currentUser.$id);
  const targetUserId = isOwnProfile ? currentUser?.$id : userId;

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================

  const [userProfile, setUserProfile] = useState(
    isOwnProfile ? currentUser : null
  );
  
  const [posts, setPosts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  const [realStats, setRealStats] = useState({
    followers: 0,
    following: 0,
    totalPosts: 0,
    isFollowing: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "myPosts";

  const [loading, setLoading] = useState(!isOwnProfile); 
  const [postsLoading, setPostsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const POST_LIMIT = 6;

  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [usersListModal, setUsersListModal] = useState({ isOpen: false, type: "" });

  // Image Cropper States
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // =========================================================
  //  SYNC EFFECT (SINGLE SOURCE OF TRUTH)
  // =========================================================
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setUserProfile((prev) => ({
        ...prev,
        ...currentUser, 
        subscribersCount: prev?.subscribersCount || currentUser.subscribersCount || 0
      }));
    }
  }, [currentUser, isOwnProfile]);

  // =========================================================
  //  DATA FETCHING
  // =========================================================

  const fetchStats = async () => {
    if (!targetUserId) return;
    try {
      const queries = [
        appwriteService.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteSubscriptionsCollectionId, [Query.equal("authorId", targetUserId), Query.limit(1)]),
        appwriteService.getUserSubscriptions(targetUserId),
        appwriteService.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, [Query.equal("userId", targetUserId), Query.limit(1)]),
      ];

      let amIFollowing = false;
      if (!isOwnProfile && currentUser) {
        const sub = await appwriteService.getSubscription(currentUser.$id, targetUserId);
        amIFollowing = !!sub;
      }

      const [followersList, followingList, totalPostsList] = await Promise.all(queries);

      setRealStats({
        followers: followersList ? followersList.total : 0,
        following: followingList ? followingList.length : 0,
        totalPosts: totalPostsList ? totalPostsList.total : 0,
        isFollowing: amIFollowing,
      });
    } catch (error) {
      console.log("Stats error", error);
    }
  };


  const fetchPosts = async (pageNum, currentTab) => {
    if (currentTab === "analytics") return;
    if (!targetUserId) return;

    setPostsLoading(true);
    try {
      const queries = [
        Query.orderDesc("isPinned"),
        Query.orderDesc("$createdAt"),
        Query.limit(POST_LIMIT),
        Query.offset((pageNum - 1) * POST_LIMIT),
      ];

      if (currentTab === "myPosts") {
          queries.push(Query.equal("userId", targetUserId));
      } 
      else if (currentTab === "liked") {
          queries.push(Query.equal("likes", targetUserId));
      }
      else if (currentTab === "shared") {
          queries.push(Query.notEqual("userId", targetUserId));
          queries.push(Query.equal("status", "inactive"));
      }
      const postsRes = await appwriteService.getPosts(queries);
      if (postsRes) {
        setPosts(postsRes.documents);
        setTotalPages(Math.ceil(postsRes.total / POST_LIMIT));
      }
    } catch (error) {
      console.error("Post error", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!isOwnProfile) return;
    setAnalyticsLoading(true);
    try {
      const res = await appwriteService.getPosts([Query.equal("userId", targetUserId), Query.orderDesc("$createdAt"), Query.limit(100)]);
      if (res) setAnalyticsData(res.documents);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      if (!targetUserId) return;
      if (!isOwnProfile) setLoading(true);
      
      try {
        const profileRes = await appwriteService.getUserProfile(targetUserId);
        if (profileRes) setUserProfile(profileRes);
        await fetchStats();
      } catch (error) {
        toast.error("User not found");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [targetUserId, isOwnProfile]);

  // Tab Handler
  useEffect(() => {
    if (targetUserId) {
      if (activeTab === "analytics") fetchAnalytics();
      else fetchPosts(page, activeTab);
    }
  }, [activeTab, page, targetUserId]);

  // =========================================================
  // ACTIONS & HANDLERS
  // =========================================================

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      setPage(1); 
      setSearchParams({ tab: tabId }); 
    }
  };

  const handleStatsClick = async (type) => {
    if (type === "posts") return; 
    setUsersListModal({ isOpen: true, type });
  };

  const handleFollowAction = async () => {
    if (!currentUser) {
        toast.error("Login required to perform this action", { icon: "🔒", style: { borderRadius: "10px", background: "#333", color: "#fff" } });
        dispatch(openAuthModal("login"));
        return;
    }
    if (isOwnProfile) return;

    const oldStats = { ...realStats };
    const newIsFollowing = !realStats.isFollowing;
    const newFollowers = newIsFollowing ? realStats.followers + 1 : Math.max(0, realStats.followers - 1);

    setRealStats((prev) => ({ ...prev, isFollowing: newIsFollowing, followers: newFollowers }));

    try {
      await appwriteService.toggleSubscribe(currentUser.$id, targetUserId);
      await appwriteService.updateUserProfile({
        documentId: userProfile.$id,
        userId: targetUserId,
        subscribersCount: newFollowers,
      });
    } catch (error) {
      setRealStats(oldStats);
      toast.error("Failed to update follow status");
    }
  };

  const handleUpdateProfile = async (data) => {
    setActionLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      const attributesJSON = JSON.stringify({
        website: data.website || "",
        twitter: data.twitter || "",
        skills: data.skills || "",
      });

      if (data.name && data.name !== currentUser.name) {
        await authService.updateName(data.name);
      }

      const updated = await appwriteService.updateUserProfile({
        userId: currentUser.$id,
        name: data.name || currentUser.name,
        username: data.username,
        bio: data.bio || userProfile?.bio,
        location: data.location || userProfile?.location,
        avatarId: data.avatarId || userProfile?.avatarId,
        documentId: userProfile?.$id,
        prefs: attributesJSON,
      });

      // Redux Sync
      dispatch(updateUserProfile({
        name: updated.name,
        username: updated.username, 
        avatarId: updated.avatarId,
        bio: updated.bio,
        location: updated.location,
        prefs: updated.prefs,
      }));

      setUserProfile(updated);
      setModalConfig({ isOpen: false, type: null });
      toast.success("Changes Saved!", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Image Handling ---
  const onFileChange = async (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setRotation(0);
        setModalConfig({ isOpen: true, type: "crop" });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const uploadCroppedImage = async () => {
    setActionLoading(true);
    const toastId = toast.loading("Uploading avatar...");
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const file = new File([await compressImage(new File([croppedBlob], "a.jpg", { type: "image/jpeg" }))], "a.jpg", { type: "image/jpeg" });
      
      const uploaded = await appwriteService.uploadFile(file);
      
      if (uploaded) {
        if (userProfile?.avatarId) await appwriteService.deleteFile(userProfile.avatarId);
        await handleUpdateProfile({ avatarId: uploaded.$id }); 
      }
      
      setModalConfig({ isOpen: false, type: null });
      setImageSrc(null);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      toast.success("New avatar updated!", { id: toastId });
    } catch (e) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Post Actions ---
  const handlePinClick = async (postToPin) => {
    if (postToPin.isPinned) {
      const toastId = toast.loading("Unpinning post...");
      await appwriteService.updatePostPinStatus(postToPin.$id, false);
      toast.success("Post unpinned", { id: toastId });
    } else {
      const toastId = toast.loading("Pinning to top...");
      await appwriteService.pinPost(currentUser.$id, postToPin.$id);
      toast.success("Post pinned to profile!", { id: toastId });
    }
    setPosts([]);
    setPage(1);
    fetchPosts(1, activeTab);
  };

  const handleDeletePost = async () => {
    if (!modalConfig.data) return;
    setActionLoading(true);
    const toastId = toast.loading("Deleting post...");
    try {
      if (modalConfig.data.featuredImage) {
        await appwriteService.deleteFile(modalConfig.data.featuredImage);
      }
      await appwriteService.deletePost(modalConfig.data.$id);
      toast.success("Post deleted", { id: toastId });

      if (activeTab === "analytics") fetchAnalytics();
      else fetchPosts(page, activeTab);

      setRealStats((prev) => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
      setModalConfig({ isOpen: false, type: null });
    } catch (error) {
      toast.error("Failed to delete post", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPost = (post) => {
  navigate(`/edit-post/${post.$id}`);
  };
  // =========================================================
  //  RENDER
  // =========================================================

  if (!targetUserId) return <div className="text-center py-20 font-bold">User not found</div>;

  return (
    <div className="py-8 w-full">
      <SEO 
          title={`${userProfile?.name || "User"} - MegaBlog Profile`}
          description={userProfile?.bio || `Check out ${userProfile?.name || "User"}'s profile and read their latest articles on MegaBlog.`}
          image={userProfile?.avatarId ? appwriteService.getFilePreview(userProfile.avatarId) : "/icons/logo.png"}
          url={window.location.href}
          type="profile" 
      />
      <Container>
        
        {/* 1. HEADER */}
        <ProfileHeader
          userProfile={userProfile}
          userData={currentUser}
          isOwnProfile={isOwnProfile}
          isFollowing={realStats.isFollowing}
          onFollowToggle={handleFollowAction}
          realStats={realStats}
          loading={loading}
          onEditClick={() => isOwnProfile && setModalConfig({ isOpen: true, type: "edit" })}
          onFileChange={onFileChange}
          onStatsClick={handleStatsClick}
        />

        {/* 2. PROGRESS */}
        {isOwnProfile && (
          <div className="mb-8">
            <UserProgress postCount={realStats.totalPosts} followerCount={realStats.followers} />
          </div>
        )}

        {/* 3. TABS */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
          {[
            { id: "myPosts", label: "Posts", icon: <Grid size={16} /> },
            { id: "liked", label: "Liked", icon: <Heart size={16} /> },
            isOwnProfile && { id: "shared", label: "Shared Drafts", icon: <Users size={16} /> },
            isOwnProfile && { id: "analytics", label: "Analytics", icon: <BarChart2 size={16} /> },
          ].filter(Boolean).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-primary-light text-primary-light"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 4. CONTENT */}
        {activeTab === "analytics" && isOwnProfile ? (
          <AnalyticsTab posts={analyticsData} loading={analyticsLoading} />
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <PostGrid
              posts={posts}
              loading={loading}
              postsLoading={postsLoading}
              onDeleteClick={activeTab === "myPosts" ? (post) => setModalConfig({ isOpen: true, type: "delete", data: post }) : undefined}
              onPinClick={activeTab === "myPosts" ? handlePinClick : undefined}
              onEditClick={(activeTab === "myPosts" || activeTab === "shared") ? handleEditPost : undefined}
              readOnly={!isOwnProfile}
            />
            
            {!postsLoading && posts.length > 0 && totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            )}
          </div>
        )}

        {/* --- MODALS --- */}
        <EditProfileModal
          isOpen={modalConfig.isOpen && modalConfig.type === "edit"}
          onClose={() => setModalConfig({ isOpen: false, type: null })}
          userProfile={userProfile}
          onUpdate={handleUpdateProfile}
          loading={actionLoading}
        />

        <UserListModal
          isOpen={usersListModal.isOpen}
          onClose={() => setUsersListModal({ ...usersListModal, isOpen: false })}
          userId={targetUserId}
          type={usersListModal.type}
          onUpdate={() => fetchStats()}
        />

        <Modal
          isOpen={modalConfig.isOpen && modalConfig.type === "crop"}
          onClose={() => setModalConfig({ isOpen: false, type: null })}
          title="Adjust Picture"
          actionLabel={<span className="flex items-center gap-2"><Check size={16} /> Upload</span>}
          onAction={uploadCroppedImage}
          loading={actionLoading}
        >
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-72 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} rotation={rotation} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} onRotationChange={setRotation} cropShape="round" showGrid={false} />
            </div>
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4"><ZoomIn size={20} className="text-gray-500" /><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-light" /></div>
              <div className="flex items-center gap-4"><RotateCw size={20} className="text-gray-500" /><input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-light" /></div>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={modalConfig.isOpen && modalConfig.type === "delete"}
          onClose={() => setModalConfig({ isOpen: false, type: null })}
          title="Delete Post?"
          actionLabel="Delete"
          onAction={handleDeletePost}
          isDanger={true}
          loading={actionLoading}
        >
          <p className="text-sm">Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{modalConfig.data?.title}"</span>?</p>
        </Modal>

      </Container>
    </div>
  );
}