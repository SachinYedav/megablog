import React, { useState, useEffect, useCallback } from "react";
import { Container, PostCard, SEO } from "../components";
import Pagination from "../components/ui/Pagination";
import appwriteService from "../appwrite/config";
import { Filter, Sparkles } from "lucide-react";
import { Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

// Imports
import PostGridSkeleton from "../components/profile/skeletons/PostGridSkeleton";
import SearchBox from "../components/SearchBox"; 

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeQuery, setActiveQuery] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const userData = useSelector((state) => state.auth.userData);
  const POSTS_PER_PAGE = 6;

  const handleSearchUpdate = useCallback((query) => {
      setActiveQuery(query);
      setSearchParams((prev) => {
          if (query) prev.set("search", query);
          else prev.delete("search");
          return prev;
      });
      setPage(1);
  }, [setSearchParams]);

  // Main Fetch Effect
  useEffect(() => {
    fetchPosts();
  }, [activeQuery, page, filterStatus]); 

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let baseQueries = [
        Query.equal("status", "active"),
        Query.limit(POSTS_PER_PAGE),
        Query.offset((page - 1) * POSTS_PER_PAGE),
        Query.orderDesc("$createdAt"),
      ];

      // --- FILTER: SUBSCRIBED ---
      if (filterStatus === "subscribed") {
        if (!userData) {
          toast.error("Login to see subscribed posts");
          setFilterStatus("all");
          setLoading(false);
          return;
        }
        const subs = await appwriteService.getUserSubscriptions(userData.$id);
        if (subs.length === 0) {
          setPosts([]);
          setTotalPosts(0);
          setLoading(false);
          return;
        }
        const authorIds = subs.map((sub) => sub.authorId).slice(0, 100);
        baseQueries.push(Query.equal("userId", authorIds));
      }

      // --- SEARCH LOGIC ---
      if (activeQuery) {
         baseQueries.push(Query.search("searchIndex", activeQuery));
      }

      const result = await appwriteService.getPosts(baseQueries);
      
      if (result) {
        setPosts(result.documents);
        setTotalPosts(result.total);
      }

    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.code !== 404) toast.error("Could not load posts");
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="w-full py-8 min-h-screen bg-gray-50 dark:bg-black/20">
      <SEO 
          title={activeQuery ? `Search results for "${activeQuery}"` : "All Posts & Articles"}
          description="Explore thousands of articles on technology, lifestyle, and more on MegaBlog."
          url={`${window.location.origin}/all-posts`}
      />
      <Container>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <Sparkles className="text-yellow-500" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Discover</h2>
              <p className="text-sm text-gray-500">Stories, news, and insights</p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-row items-center gap-2 w-full md:w-auto bg-white dark:bg-gray-900 p-1.5 md:p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            
            {/* Filter Dropdown */}
            <div className="relative shrink-0 border-r border-gray-200 dark:border-gray-700 pr-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-7 pr-6 py-2 bg-transparent outline-none cursor-pointer font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-200 w-auto"
              >
                <option value="all">Global</option>
                <option value="subscribed">Following</option>
              </select>
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-light pointer-events-none" size={14} />
            </div>

            {/* Search Box */}
            <SearchBox 
                onSearch={handleSearchUpdate} 
                initialValue={activeQuery} 
            />
          </div>
        </div>

        {/* POSTS GRID */}
        {loading ? (
          <PostGridSkeleton />
        ) : posts.length > 0 ? (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.$id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <PostCard {...post} likes={post.likesCount || 0} views={post.views || 0} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-24">
            <div className="inline-flex p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
               {/* Fixed: Removed search logic from here, just showing icon */}
               <Filter size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              No results found
            </h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              {filterStatus === "subscribed" 
                ? "You are not following anyone yet, or they haven't posted." 
                : `We couldn't find anything matching "${activeQuery}".`}
            </p>
            {filterStatus === "subscribed" && (
              <button onClick={() => setFilterStatus("all")} className="mt-6 px-6 py-2 bg-primary-light text-white rounded-lg hover:shadow-lg transition-all">
                Switch to Global Feed
              </button>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default AllPosts;