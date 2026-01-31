import React, { useState, useEffect, useCallback } from "react";
import PostGridSkeleton from "../components/profile/skeletons/PostGridSkeleton";
import AuthorListSkeleton from "../components/profile/skeletons/AuthorListSkeleton";
import {
  Container,
  PostCard,
  Button,
  Skeleton,
  Modal,
  SEO,
} from "../components";
import appwriteService from "../appwrite/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Users, UserMinus, ArrowRight, Loader2, FilterX } from "lucide-react";
import toast from "react-hot-toast";
import { Query } from "appwrite";

function Subscriptions() {
  const navigate = useNavigate();
  
  const userData = useSelector((state) => state.auth.userData);

  // Data States
  const [subscribedAuthors, setSubscribedAuthors] = useState([]);
  const [allSubscribedIds, setAllSubscribedIds] = useState([]); 
  const [feedPosts, setFeedPosts] = useState([]);

  // Filter State
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);

  // Loading States
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [authorToUnsub, setAuthorToUnsub] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const POST_LIMIT = 6;

  // ---------------------------------------------------------
  // 1. FETCH FUNCTIONS (Memoized)
  // ---------------------------------------------------------

  const fetchFeedPosts = useCallback(async (targetIds, pageNum, reset = false) => {
    if (!targetIds || targetIds.length === 0) {
      setFeedPosts([]);
      setFeedLoading(false);
      return;
    }

    if (pageNum === 1) setFeedLoading(true);
    else setMoreLoading(true);

    try {
      const idQuery = Array.isArray(targetIds) ? targetIds : [targetIds];

      const queries = [
        Query.equal("userId", idQuery),
        Query.orderDesc("$createdAt"),
        Query.limit(POST_LIMIT),
        Query.offset((pageNum - 1) * POST_LIMIT),
      ];

      const postsRes = await appwriteService.getPosts(queries);

      if (postsRes) {
        if (pageNum === 1 || reset) {
          setFeedPosts(postsRes.documents);
        } else {
          setFeedPosts((prev) => [...prev, ...postsRes.documents]);
        }
        setHasMore(postsRes.documents.length === POST_LIMIT);
      }
    } catch (error) {
      console.error("Feed error:", error);
    } finally {
      setFeedLoading(false);
      setMoreLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!userData?.$id) return;
    
    try {
      const subsList = await appwriteService.getUserSubscriptions(userData.$id);

      if (subsList.length > 0) {
        const authorIds = subsList.map((sub) => sub.authorId);
        setAllSubscribedIds(authorIds);

        const authorPromises = authorIds.map((id) =>
          appwriteService.getUserProfile(id).catch(() => null) // Fail silently for individual errors
        );
        const profiles = await Promise.all(authorPromises);

        const validProfiles = profiles.filter((p) => p !== null);
        setSubscribedAuthors(validProfiles);

        // Fetch Feed for ALL authors initially
        fetchFeedPosts(authorIds, 1);
      } else {
        setFeedLoading(false);
      }
    } catch (error) {
      console.error("Subscription fetch error:", error);
      toast.error("Could not load subscriptions");
      setFeedLoading(false);
    } finally {
      setLoadingAuthors(false);
    }
  }, [userData, fetchFeedPosts]);

  //  INITIAL LOAD
  useEffect(() => {
    if (userData) {
      fetchSubscriptions();
    } else {
      setLoadingAuthors(false);
      setFeedLoading(false);
    }
  }, [userData, fetchSubscriptions]);

  // ---------------------------------------------------------
  //  HANDLERS
  // ---------------------------------------------------------

  const handleAuthorClick = (authorId) => {
    if (selectedAuthorId === authorId) {
      // Deselect (Show All)
      setSelectedAuthorId(null);
      setPage(1);
      fetchFeedPosts(allSubscribedIds, 1, true);
    } else {
      // Select Specific
      setSelectedAuthorId(authorId);
      setPage(1);
      fetchFeedPosts([authorId], 1, true);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const targetIds = selectedAuthorId ? [selectedAuthorId] : allSubscribedIds;
    fetchFeedPosts(targetIds, nextPage);
  };

  const initiateUnsubscribe = (e, author) => {
    e.stopPropagation();
    setAuthorToUnsub(author);
    setModalOpen(true);
  };

  const confirmUnsubscribe = async () => {
    if (!authorToUnsub) return;
    setActionLoading(true);

    try {
      await appwriteService.toggleSubscribe(userData.$id, authorToUnsub.userId);

      const newAuthors = subscribedAuthors.filter(
        (a) => a.userId !== authorToUnsub.userId
      );
      setSubscribedAuthors(newAuthors);

      const newIds = allSubscribedIds.filter(
        (id) => id !== authorToUnsub.userId
      );
      setAllSubscribedIds(newIds);

      if (selectedAuthorId === authorToUnsub.userId) {
        setSelectedAuthorId(null);
        fetchFeedPosts(newIds, 1, true); 
      } else {
        setFeedPosts((prev) =>
          prev.filter((p) => p.userId !== authorToUnsub.userId)
        );
      }

      toast.success(`Unsubscribed from ${authorToUnsub.name}`);
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to unsubscribe");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------
  //  RENDER
  // ---------------------------------------------------------

  if (!userData) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Login Required</h2>
                <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full py-8 min-h-screen bg-gray-50 dark:bg-black/20">
      <SEO title="My Subscriptions" />
      <Container>
        
        {/* 1. AUTHORS LIST (Stories Style) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="text-primary-light" /> Subscriptions
            </h2>

            {selectedAuthorId && (
              <button
                onClick={() => handleAuthorClick(selectedAuthorId)}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full transition-colors"
              >
                <FilterX size={14} /> Clear Filter
              </button>
            )}
          </div>

          {loadingAuthors ? (
             <AuthorListSkeleton />
          ) : subscribedAuthors.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scroll-smooth px-2">
              {subscribedAuthors.map((author) => {
                const isSelected = selectedAuthorId === author.userId;

                return (
                  <div
                    key={author.$id}
                    onClick={() => handleAuthorClick(author.userId)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer relative"
                  >
                    {/* Avatar Circle */}
                    <div
                      className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-all duration-300 relative
                    ${
                      isSelected
                        ? "bg-gradient-to-tr from-primary-light to-purple-600 shadow-lg shadow-primary-light/30 scale-105"
                        : "bg-transparent border-2 border-gray-200 dark:border-gray-700 hover:border-primary-light"
                    }
                  `}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 relative">
                        {author.avatarId ? (
                          <img
                            src={appwriteService.getFilePreview(author.avatarId)}
                            alt={author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-xl">
                            {author.name ? author.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                      </div>

                      {/* Active Indicator */}
                      {isSelected && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-light text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold animate-in zoom-in">
                          Active
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <p
                      className={`text-xs font-medium w-20 text-center truncate transition-colors ${
                        isSelected
                          ? "text-primary-light font-bold"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      }`}
                    >
                      {author.name || "Unknown"}
                    </p>

                    {/* Unsubscribe Button */}
                    <button
                      onClick={(e) => initiateUnsubscribe(e, author)}
                      className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 text-gray-400 cursor-pointer hover:text-red-500 p-1.5 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-all z-20"
                      title="Unsubscribe"
                    >
                      <UserMinus size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">You haven't subscribed to anyone yet.</p>
              <Button
                onClick={() => navigate("/all-posts")}
                className="mt-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200"
              >
                Find Authors <ArrowRight size={16} className="ml-2 inline" />
              </Button>
            </div>
          )}
        </div>

        {/* 2. FEED SECTION */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedAuthorId ? "Channel Posts" : "Latest Updates"}
            </h3>
            {selectedAuthorId && (
              <span className="text-xs bg-primary-light/10 text-primary-light px-2 py-0.5 rounded font-medium">
                Filtered
              </span>
            )}
          </div>

          {feedLoading ? (
            <PostGridSkeleton />
            ) : feedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {feedPosts.map((post) => (
                  <div key={post.$id}>
                    <PostCard
                      {...post}
                      likes={post.likes || 0}
                      views={post.views || 0}
                    />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={moreLoading}
                    bgColor="bg-white dark:bg-gray-800"
                    textColor="text-gray-800 dark:text-white"
                    className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-2.5 shadow-sm transition-all rounded-full"
                  >
                    {moreLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} /> Loading...
                      </span>
                    ) : (
                      "Load More Stories"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl">
              <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                <FilterX size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                No posts found for this selection.
              </p>
              {selectedAuthorId && (
                <button
                  onClick={() => handleAuthorClick(selectedAuthorId)}
                  className="text-primary-light text-sm mt-2 hover:underline"
                >
                  Show all posts
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- UNSUBSCRIBE MODAL --- */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Unsubscribe?"
          actionLabel="Yes, Unsubscribe"
          onAction={confirmUnsubscribe}
          isDanger={true}
          loading={actionLoading}
        >
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to stop seeing updates from{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {authorToUnsub?.name}
            </span>
            ?
          </p>
        </Modal>
      </Container>
    </div>
  );
}

export default Subscriptions;