import React from "react";
import {
  MapPin,
  Calendar,
  Link as LinkIcon,
  Twitter,
  Edit3,
  Camera,
  Award,
  UserPlus,
  UserCheck,
} from "lucide-react";
import appwriteService from "../../appwrite/config";
import { Button } from "../index";
import ProfileHeaderSkeleton from "./skeletons/ProfileHeaderSkeleton";

export default function ProfileHeader({
  userProfile,
  userData,
  realStats,
  loading,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  onEditClick,
  onFileChange,
  onStatsClick,
}) {
  
  if (loading) return <ProfileHeaderSkeleton />;

  // Safe Parsing
  let extraDetails = {};
  try {
    extraDetails = userProfile?.prefs ? JSON.parse(userProfile.prefs) : {};
  } catch (error) {
    extraDetails = {};
  }
  const handleFollowClick = async () => {
    onFollowToggle(); 

    if (!isFollowing && userData && userProfile) {
      try {
        await appwriteService.sendNotification({
          userId: userProfile.userId, 
          type: "follow",             
          actorId: userData.$id,      
          actorName: userData.name,   
          actorAvatar: userData.prefs?.avatarId || userData.avatarId,
          message: "started following you",
          link: `/user/${userData.$id}`, 
          targetUserId: userProfile.userId 
        });
        console.log("🔔 Follow Notification Sent!");
      } catch (error) {
        console.error("Notification Failed:", error);
      }
    }
  };

  //  2. Render Real UI
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-white/20 dark:border-gray-800 mb-8 relative overflow-hidden transition-all duration-300 animate-in fade-in">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
        
        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-200 relative">
            {userProfile?.avatarId ? (
              <img src={appwriteService.getFilePreview(userProfile.avatarId)} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-liner-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                {userProfile?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <label className="absolute bottom-1 right-1 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all z-20 hover:scale-110">
              <Camera size={18} className="text-gray-600 dark:text-gray-200" />
              <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </label>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight wrap-break-word">
                  {userProfile?.name}
                </h1>
                {userProfile?.isPro && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Award size={10} /> PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-medium mt-1">
                @{userProfile?.username || userProfile?.name?.replace(/\s/g, "").toLowerCase()}
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto mt-3 md:mt-0">
              {isOwnProfile ? (
                <Button onClick={onEditClick} className="rounded-full px-6 h-10 w-full md:w-auto flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 font-semibold shadow-sm transition-all">
                <Edit3 size={14} /> Edit Profile
                </Button>

              ) : (
                <Button onClick={handleFollowClick} className={`rounded-full px-6 h-10 w-full md:w-auto flex items-center justify-center gap-2 text-sm transition-all ${isFollowing ? "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200" : "bg-primary-light text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30"}`}>
                  {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />} {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-center md:text-left max-w-2xl">
            {userProfile?.bio || "Writer. Thinker. Creator. Updating my bio soon!"}
          </p>

          {/* Skills Section */}
          {extraDetails?.skills && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              {extraDetails.skills.split(',').map((skill, index) => (
                skill.trim() && (
                  <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800">
                    {skill.trim()}
                  </span>
                )
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4">
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
              <Calendar size={14} className="text-primary-light" /> Joined {new Date(userProfile?.$createdAt).toLocaleDateString()}
            </span>
            {userProfile?.location && (
              <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                <MapPin size={14} className="text-primary-light" /> {userProfile.location}
              </span>
            )}
            {extraDetails.website && (
              <a href={extraDetails.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary-light transition-colors px-2 py-1.5">
                <LinkIcon size={14} /> Website
              </a>
            )}
            {extraDetails.twitter && (
              <a href={`https://twitter.com/${extraDetails.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1.5">
                <Twitter size={14} /> {extraDetails.twitter}
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 md:flex md:divide-x-0 md:gap-8 border-t border-gray-100 dark:border-gray-800 mt-6 pt-5">
            <StatItem label="Followers" value={realStats.followers} onClick={() => onStatsClick("followers")} />
            <StatItem label="Following" value={realStats.following} onClick={() => onStatsClick("following")} />
            <StatItem label="Posts" value={realStats.totalPosts} onClick={() => onStatsClick("posts")} />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatItem = ({ label, value, onClick }) => (
  <div onClick={onClick} className="text-center md:text-left cursor-pointer group px-2 sm:px-4 md:px-0">
    <span className="block font-bold text-gray-900 dark:text-white text-lg md:text-xl group-hover:text-primary-light transition-colors">{value}</span>
    <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
  </div>
);