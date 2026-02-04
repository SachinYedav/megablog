import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { openAuthModal } from "../store/authSlice";
import { cachePost } from "../store/postSlice";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import ParseHTML from "../components/RTE/ParseHTML";

// --- ICONS ---
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreHorizontal,
  Bookmark,
  Hash,
  BadgeCheck,
  MessageCircle,
  MessageSquare,
  Lock,
  ChevronRight
} from "lucide-react";

// --- SERVICES ---
import appwriteService from "../appwrite/config";
import conf from "../conf/conf";

// --- COMPONENTS ---
import { ShareModal, ReportModal } from "../components";
import {Modal} from "../components/index"; 
import PostSkeleton from "./Post/PostSkeleton";
import CommentSection from "./Post/CommentSection";
import RelatedPosts from "./Post/RelatedPosts";
import AdsComponent from "../components/AdsComponent";
import LiveDiscussion from "./Post/LiveDiscussion";

export default function Post() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  //  SINGLE SOURCE OF TRUTH
  const userData = useSelector((state) => state.auth.userData);
  const cachedPosts = useSelector((state) => state.posts.cache);

  // --- STATE MANAGEMENT ---
  const [post, setPost] = useState(cachedPosts[slug] || null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(!cachedPosts[slug]);

  // Interactions
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportConfig, setReportConfig] = useState({ targetId: null, type: "post" });

  // Newsletter
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  // UI: Reading Progress
  const [readingProgress, setReadingProgress] = useState(0);


  // --- 1. SCROLL LISTENER (Progress Bar) ---
  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
          setReadingProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // --- 2. PROFILE SYNC HELPER ---
  const refreshAuthorProfile = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const profile = await appwriteService.getUserProfile(userId);
      if (profile) setAuthorProfile(profile);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  }, []);

  // --- 3. MAIN DATA FETCHING ---
  useEffect(() => {
    if (!slug) return navigate("/");
    
    let isMounted = true; 

    const fetchData = async () => {
      if (!cachedPosts[slug]) setLoading(true);

      try {
        const postData = await appwriteService.getPost(slug);
        if (!postData) throw new Error("Post not found");

        if (isMounted) {
          setPost(postData);
          dispatch(cachePost({ slug, data: postData }));
          setLikes(Array.isArray(postData.likes) ? postData.likes : []);
          setDislikes(Array.isArray(postData.dislikes) ? postData.dislikes : []);
        }

        if (navigator.onLine) {
          appwriteService.updatePost(postData.$id, { views: (Number(postData.views) || 0) + 1 }).catch(() => {});
        }
        
        if (userData) {
          appwriteService.addToHistory({ userId: userData.$id, postId: postData.$id }).catch(() => {});
        }

        // Fetch Related Data
        const [profile, subStatus] = await Promise.all([
          appwriteService.getUserProfile(postData.userId).catch(() => null),
          userData ? appwriteService.getSubscription(userData.$id, postData.userId).catch(() => null) : null,
        ]);

        if (isMounted) {
          if (profile) setAuthorProfile(profile);
          setIsSubscribed(!!subStatus);
        }

        // Check Bookmark
        if (userData) {
          appwriteService.isPostBookmarked(userData.$id, postData.$id)
            .then((doc) => { if (isMounted && doc) setBookmarkId(doc.$id); })
            .catch(() => { if (isMounted) setBookmarkId(null); });
        }

      } catch (error) {
        console.error("Fetch Error:", error);
        
        if (cachedPosts[slug]) {
          if (isMounted) {
            setPost(cachedPosts[slug]);
            toast("Viewing offline version", { icon: "📡" });
          }
        } else {
          toast.error("You are offline & post not saved.");
          navigate("/");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [slug, navigate, userData]);

  // --- 4. REAL-TIME LISTENER ---
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (post && userData && post.userId === userData.$id) {
        refreshAuthorProfile(post.userId);
      }
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, [post, userData, refreshAuthorProfile]);

  // --- 5. ACTION HANDLERS ---

  // AUTH CHECK HELPER
  const checkAuth = () => {
    if (!userData) {
      toast.error("Login required to perform this action", {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      dispatch(openAuthModal("login")); 
      return false;
    }
    return true;
  };
  const handlePostReaction = async (type) => {
    if (!checkAuth()) return; 
    
    const oldLikes = [...likes];
    const oldDislikes = [...dislikes];
    let newLikes = [...likes];
    let newDislikes = [...dislikes];

    if (type === "like") {
      if (newLikes.includes(userData.$id)) {
        newLikes = newLikes.filter((id) => id !== userData.$id);
      } else {
        newLikes.push(userData.$id);
        newDislikes = newDislikes.filter((id) => id !== userData.$id);
      }
    } else {
      if (newDislikes.includes(userData.$id)) {
        newDislikes = newDislikes.filter((id) => id !== userData.$id);
      } else {
        newDislikes.push(userData.$id);
        newLikes = newLikes.filter((id) => id !== userData.$id);
      }
    }

    setLikes(newLikes);
    setDislikes(newDislikes);

    try {
      await appwriteService.toggleReaction(
        conf.appwriteCollectionId,
        post.$id,
        userData.$id,
        type,
        oldLikes,
        oldDislikes
      );

      // Notification Logic
      if (type === "like" && post.userId !== userData.$id && newLikes.length > oldLikes.length) {
        const actorName = userData.fullName || userData.name;
        const actorAvatar = userData.avatarId || userData.prefs?.avatarId;
        appwriteService.sendNotification({
          type: "like",
          actorId: userData.$id,
          actorName,
          actorAvatar,
          targetUserId: post.userId,
          postId: post.$id,
          postTitle: post.title,
          postImage: post.featuredImage,
        });
      }
    } catch {
      setLikes(oldLikes);
      setDislikes(oldDislikes);
      toast.error("Action failed");
    }
  };

  const performSubscription = async () => {
    if (!checkAuth()) return; 
    if (userData.$id === post.userId) return toast.error("Cannot subscribe to self");
    if (!authorProfile?.$id) return toast.error("Author profile unavailable");

    const oldIsSubscribed = isSubscribed;
    const newIsSubscribed = !oldIsSubscribed;
    const newCount = newIsSubscribed
      ? (authorProfile.subscribersCount || 0) + 1
      : Math.max(0, (authorProfile.subscribersCount || 0) - 1);

    setIsSubscribed(newIsSubscribed);
    setAuthorProfile((prev) => ({ ...prev, subscribersCount: newCount }));

    try {
      await Promise.all([
        appwriteService.toggleSubscribe(userData.$id, post.userId),
        appwriteService.updateUserProfile({
          documentId: authorProfile.$id,
          userId: post.userId,
          subscribersCount: newCount,
        }),
      ]);

      if (newIsSubscribed) {
        const actorName = userData.fullName || userData.name;
        const actorAvatar = userData.avatarId || userData.prefs?.avatarId;
        appwriteService.sendNotification({
          type: "follow",
          actorId: userData.$id,
          actorName,
          actorAvatar,
          targetUserId: post.userId,
        });
        toast.success("Subscribed!");
      } else {
        toast.success("Unsubscribed");
      }
    } catch (error) {
      setIsSubscribed(oldIsSubscribed);
      toast.error("Network error");
    }
  };

  const handleSave = async () => {
    if (!checkAuth()) return; 
    
    if (isSaving) return; 
    setIsSaving(true);

    try {
      if (bookmarkId) {
        await appwriteService.deleteBookmark(bookmarkId);
        setBookmarkId(null);
        toast.success("Removed from bookmarks");
      } else {
        const result = await appwriteService.addBookmark({
          userId: userData.$id,
          postId: post.$id,
        });
        if (result) {
          setBookmarkId(result.$id);
          toast.success("Saved to bookmarks");
        }
      }
    } catch (e) {
      console.error("Bookmark Error:", e);
      toast.error("Action failed");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return toast.error("Enter a valid email");
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setEmail("");
      toast.success("Thanks for subscribing!");
    }, 1500);
  };

  const openReportModal = (id = post.$id, type = "post") => {
    if (!checkAuth()) return; 
    setReportConfig({ targetId: id, type });
    setShowReport(true);
  };

  const submitReport = async (reason) => {
    try {
      await appwriteService.createReport({
        reporterId: userData.$id,
        targetId: reportConfig.targetId,
        targetType: reportConfig.type,
        reason,
      });
      setShowReport(false);
      toast.success("Report submitted successfully");
    } catch {
      toast.error("Failed to submit report");
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "").replace(/"/g, "'").replace(/\s+/g, " ").trim();
  };

  // --- 6. RENDER LOGIC ---
  if (loading) return <><SEO title="Reading..." /><PostSkeleton /></>;
  if (!post) return null;

  const tagsList = post.tags ? post.tags.split(",").filter((t) => t.trim()) : [];

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen w-full relative pb-28 md:pb-0">
      <SEO 
          title={post.title} 
          description={post.summary && post.summary.trim() !== "" ? post.summary : stripHtml(post.content).substring(0, 160) + "..."}
          image={appwriteService.getFilePreview(post.featuredImage)}
          type="article"
          url={window.location.href}
          author={authorProfile?.name || "MegaBlog Author"}
          publishedTime={post.$createdAt}
      />

      <div className="fixed top-0 left-0 h-1 bg-primary-light z-[100] transition-all duration-150 ease-out" style={{ width: `${readingProgress}%` }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          
          {/* =========================================
              LEFT / MAIN CONTENT (8 Columns) 
             ========================================= */}
          <div className="lg:col-span-8">
            <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link to="/" className="hover:text-primary-light transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link to="/all-posts" className="hover:text-primary-light transition-colors">Posts</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-[150px]">{post.title}</span>
            </nav>
            
            {/* Category / Date */}
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold uppercase tracking-wide">
               <Link 
                 to={`/all-posts?search=${tagsList[0] || ""}`} 
                 className="text-primary-light hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
               >
                 {tagsList[0] || "Article"}
               </Link>
               <span>•</span>
               <span>{new Date(post.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
              {post.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800 mb-8">
               <div className="flex items-center gap-3">
                  <Link to={`/user/${post.userId}`} className="relative group">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500 group-hover:scale-105 transition-transform">
                         <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                            {authorProfile?.avatarId ? (
                               <img src={appwriteService.getFilePreview(authorProfile.avatarId)} className="w-full h-full object-cover" alt={authorProfile.name} />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">{post.userId[0]?.toUpperCase()}</div>
                            )}
                         </div>
                      </div>
                  </Link>
                  <div>
                      <Link to={`/user/${post.userId}`} className="flex items-center gap-1 font-bold text-gray-900 dark:text-white hover:text-primary-light transition-colors text-base md:text-lg">
                         {authorProfile?.name || "User"}
                         {authorProfile?.isPro && <BadgeCheck size={16} className="text-blue-500 fill-blue-50" />}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                         {authorProfile?.subscribersCount || 0} Followers
                      </p>
                  </div>
               </div>
               
               <button 
                  onClick={performSubscription} 
                  className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-sm ${isSubscribed ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black"}`}
               >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
               </button>
            </div>

            {/* Featured Image */}
            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm mb-8 border border-gray-100 dark:border-gray-800">
              <img src={appwriteService.getFilePreview(post.featuredImage)} className="w-full h-full object-cover" alt={post.title} />
            </div>

            <div className="mb-8">
               <AdsComponent type="horizontal" className="h-[100px] md:h-[120px]" />
            </div>

            {/* 🟢 SAFE CONTENT RENDERING (Images/Videos fit to screen) */}
            <article className="
                prose dark:prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white 
                prose-p:text-gray-700 dark:prose-p:text-gray-300 
                prose-a:text-primary-light hover:prose-a:underline 
                prose-img:max-w-full prose-img:h-auto prose-img:rounded-xl prose-img:shadow-sm
                prose-iframe:w-full prose-iframe:aspect-video prose-iframe:rounded-xl prose-iframe:shadow-md
                [&_iframe]:max-w-full [&_iframe]:h-auto
                [&_img]:max-w-full [&_img]:h-auto
            ">
              <ParseHTML content={post.content} />
            </article>

            {/* Tags */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                {tagsList.map((tag, index) => (
                  <Link key={index} to={`/all-posts?search=${tag.trim()}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-primary-light hover:text-white transition-colors border border-gray-100 dark:border-gray-800 hover:border-transparent">
                    <Hash size={14} /> {tag.trim()}
                  </Link>
                ))}
              </div>
            )}

            {/* Action Bar (Desktop) */}
            <div className="hidden md:flex items-center justify-between mt-8 py-4 border-y border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-full p-1">
                      <button onClick={() => handlePostReaction("like")} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${likes.includes(userData?.$id) ? "bg-white dark:bg-gray-700 shadow-sm text-red-500" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                         <ThumbsUp size={18} fill={likes.includes(userData?.$id) ? "currentColor" : "none"} /> 
                         <span className="font-bold text-sm">{likes.length}</span>
                      </button>
                      <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                      <button onClick={() => handlePostReaction("dislike")} className={`px-3 py-1.5 rounded-full transition-colors ${dislikes.includes(userData?.$id) ? "text-gray-900 dark:text-white" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                         <ThumbsDown size={18} fill={dislikes.includes(userData?.$id) ? "currentColor" : "none"} />
                      </button>
                  </div>
                  <button onClick={() => setShowShare(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors text-sm">
                     <Share2 size={18} /> Share
                  </button>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                     onClick={handleSave} 
                     disabled={isSaving}
                     className={`p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 ${
                       bookmarkId ? "text-yellow-500" : "text-gray-400"
                     } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`} 
                   >
                   <Bookmark size={20} fill={bookmarkId ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => openReportModal(post.$id, "post")} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                     <MoreHorizontal size={20} />
                  </button>
               </div>
            </div>

            <div id="live-discussion" className="min-h-[500px] mt-8 relative">
                <LiveDiscussion key={post.$id} articleId={post.$id} articleTitle={post.title} />
            </div>

            <div className="my-8">
               <AdsComponent type="vertical" className="h-[120px]" />
            </div>

            {/* Comments (Standard) */}
            <div id="comments-section">
                <CommentSection postId={post.$id} authorId={post.userId} postTitle={post.title} postImage={post.featuredImage} onReport={(commentId) => openReportModal(commentId, "comment")} />
            </div>
          </div>

          {/* =========================================
              RIGHT / STICKY SIDEBAR (4 Columns)
             ========================================= */}
          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-24 space-y-8">
                
                <AdsComponent type="square" className="h-[300px]" />

                {/* Related Posts */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                   <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                      Recommended Reads
                   </h3>
                   <RelatedPosts currentPostId={post.$id} currentUserId={post.userId} />
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                   <h4 className="font-bold text-lg mb-2 relative z-10">Weekly Digest 📩</h4>
                   <p className="text-indigo-100 text-xs mb-4 relative z-10">Get the best stories delivered to your inbox.</p>
                   <form onSubmit={handleNewsletterSubmit} className="relative z-10">
                       <input 
                          type="email" 
                          placeholder="Your email address" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg text-gray-900 text-sm mb-2 outline-none border-2 border-transparent focus:border-white/50 transition-all placeholder-gray-400" 
                       />
                       <button type="submit" disabled={subscribing} className="w-full bg-black/30 hover:bg-black/50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center">
                          {subscribing ? "Subscribing..." : "Subscribe"}
                       </button>
                   </form>
                </div>

                <div className="text-xs text-gray-400 text-center px-4 flex flex-col gap-2">
                   <Link to="/help?tab=about"><span>&copy; {new Date().getFullYear()} MegaBlog Inc.</span></Link>
                   <div className="flex items-center justify-center gap-3">
                        <Link to="/help?tab=privacy" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link> 
                        <span>•</span>
                        <Link to="/help?tab=terms" className="hover:underline hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* MOBILE FLOATING ACTION BAR */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full shadow-2xl z-50 flex justify-around items-center p-2 md:hidden">
         <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-1 py-1">
             <button onClick={() => handlePostReaction("like")} className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full transition-all active:scale-95 ${likes.includes(userData?.$id) ? "text-red-500 bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}>
                <ThumbsUp size={18} fill={likes.includes(userData?.$id) ? "currentColor" : "none"} />
                <span className="text-xs font-bold">{likes.length > 0 ? likes.length : ""}</span>
             </button>
             <button onClick={() => handlePostReaction("dislike")} className={`flex items-center justify-center px-2 py-1.5 rounded-full transition-all active:scale-95 ${dislikes.includes(userData?.$id) ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                <ThumbsDown size={18} fill={dislikes.includes(userData?.$id) ? "currentColor" : "none"} />
             </button>
         </div>
         
         <button onClick={() => { document.getElementById("comments-section")?.scrollIntoView({behavior: "smooth"}) }} className="flex flex-col items-center gap-0.5 text-gray-500 active:scale-95 transition-transform p-2">
            <MessageCircle size={20} />
         </button>

         <button onClick={() => { document.getElementById("live-discussion")?.scrollIntoView({behavior: "smooth"}) }} className="flex flex-col items-center gap-0.5 text-green-500 active:scale-95 transition-transform p-2 relative">
            <MessageSquare size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
         </button>

         <button onClick={handleSave} disabled={isSaving} className={`flex flex-col items-center gap-0.5 active:scale-95 transition-transform p-2 ${bookmarkId ? "text-yellow-500" : "text-gray-500"} ${isSaving ? "opacity-50" : ""}`}>
            <Bookmark size={20} fill={bookmarkId ? "currentColor" : "none"} />
         </button>
         <button onClick={() => setShowShare(true)} className="flex flex-col items-center gap-0.5 text-gray-500 active:scale-95 transition-transform p-2">
            <Share2 size={20} />
         </button>
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} title={post.title} url={window.location.href} />
      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} onSubmit={submitReport} />
    </div>
  );
}