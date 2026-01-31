import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, openAuthModal } from "../../store/authSlice";
import authService from "../../appwrite/auth";
import appwriteService from "../../appwrite/config";
import conf from "../../conf/conf";
import { Query } from "appwrite";
import { calculateLevel } from "../utils/gamification";
import { Modal, Skeleton } from "../index";
import toast from "react-hot-toast";

import {
  Home,
  Compass,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  User,
  LogIn,
  MessageCircle ,
  MessageCircleQuestionMark,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData, status: authStatus } = useSelector((state) => state.auth);

  // --- STATES ---
  const [currentRank, setCurrentRank] = useState("Rookie");
  const [RankIcon, setRankIcon] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // --- GAMIFICATION DATA FETCH ONLY ---
  useEffect(() => {
    let isMounted = true;

    const fetchGamificationStats = async () => {
      if (!userData?.$id) {
        setStatsLoading(false);
        return;
      }

      try {
        const [followersData, postsData] = await Promise.all([
          appwriteService.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteSubscriptionsCollectionId,
            [Query.equal("authorId", userData.$id), Query.limit(1)]
          ),
          appwriteService.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteCollectionId,
            [Query.equal("userId", userData.$id), Query.limit(1)]
          ),
        ]);

        if (!isMounted) return;

        const totalFollowers = followersData?.total || 0;
        const totalPosts = postsData?.total || 0;

        const { currentLevel } = calculateLevel(totalPosts, totalFollowers);
        setCurrentRank(currentLevel.label);
        setRankIcon(() => currentLevel.icon);
      } catch (error) {
        console.error("Stats Error:", error);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    fetchGamificationStats();

    return () => {
      isMounted = false;
    };
  }, [userData]); 

  // --- LOGOUT LOGIC ---
  const handleLogoutConfirm = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await authService.logout();
      dispatch(logout()); // Clears Redux
      toast.success("Logged out successfully", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error("Logout failed", { id: toastId });
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { name: "Home", path: "/", icon: <Home size={20} />, public: true },
    { name: "All Posts", path: "/all-posts", icon: <Compass size={20} />, public: true },
    { name: "Add Post", path: "/add-post", icon: <PlusCircle size={20} />, public: false },
    { name: "Subscriptions", path: "/subscriptions", icon: <Users size={20} />, public: false },
    { name: "Profile", path: "/profile", icon: <User size={20} />, public: false },
    { name: "Settings", path: "/settings", icon: <Settings size={20} />, public: false },
    { name: "Help & Support", path: "/help", icon: <MessageCircleQuestionMark size={20} />, public: true },
  ];

  const handleNavClick = (e, item) => {
    if (!item.public && !authStatus) {
      e.preventDefault();
      dispatch(openAuthModal("login"));
    }
  };

  return (
    <>
      <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between py-6 px-4 hidden md:flex z-50 transition-all duration-300">
        <div>
          {/* USER CARD */}
          {authStatus && userData ? (
            <div className="mb-8 px-2 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Avatar from Redux */}
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-primary-light to-purple-500 shadow-md">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px] overflow-hidden">
                  {userData.avatarId ? (
                    <img
                      src={appwriteService.getFilePreview(userData.avatarId)}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                      {userData.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                  {userData.name}
                </p>
                {/* Rank (Loaded via API) */}
                {statsLoading ? (
                  <Skeleton width="60px" height="16px" className="mt-1" />
                ) : (
                  <div className="flex items-center gap-1 text-xs font-medium text-primary-light bg-primary-light/10 px-2 py-0.5 rounded-full w-fit mt-1 border border-primary-light/20">
                    {RankIcon && <RankIcon size={10} />}
                    <span>{currentRank}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // GUEST MODE
            <div className="mb-8 px-4 py-4 bg-blue-50 dark:bg-gray-800/50 rounded-xl border border-blue-100 dark:border-gray-700 text-center animate-in fade-in">
              <h3 className="font-bold text-gray-800 dark:text-white">Guest Mode</h3>
              <p className="text-xs text-gray-500 mb-3">Join to write & share</p>
              <button
                onClick={() => dispatch(openAuthModal("signup"))}
                className="text-xs bg-primary-light text-white px-4 py-2 rounded-full font-bold w-full hover:shadow-md transition-all hover:bg-primary-dark"
              >
                Create Account
              </button>
            </div>
          )}

          {/* NAVIGATION */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-primary-light text-white shadow-lg shadow-primary-light/30 translate-x-1"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-light dark:hover:text-white"
                  } ${!item.public && !authStatus ? "opacity-70" : ""}`
                }
              >
                <span className="group-hover:scale-110 transition-transform duration-200 relative z-10">
                  {item.icon}
                </span>
                <span className="relative z-10">{item.name}</span>
                {!item.public && !authStatus && (
                  <span className="ml-auto text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                    🔒
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* BOTTOM ACTIONS */}
        <div>
          {authStatus ? (
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200 font-medium group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => dispatch(openAuthModal("login"))}
              className="w-full flex items-center gap-3 px-4 py-3 text-primary-light font-bold hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
            >
              <LogIn size={20} />
              <span>Login Now</span>
            </button>
          )}
        </div>
      </aside>

      {/* MODAL */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        actionLabel="Yes, Logout"
        onAction={handleLogoutConfirm}
        isDanger={true}
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to log out?
        </p>
      </Modal>
    </>
  );
}