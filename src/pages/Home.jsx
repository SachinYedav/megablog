import React, { useEffect, useState, useCallback } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard,  Button, SEO } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";;
import { PenTool, ArrowRight, Sparkles, Flame, Clock } from "lucide-react";
import { Query } from "appwrite";
import { openAuthModal } from "../store/authSlice";
import PostGridSkeleton from "../components/profile/skeletons/PostGridSkeleton";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "trending";

  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  //  FETCH LOGIC 
const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
        let queries = [
            Query.equal("status", "active"), 
            Query.limit(6)
        ];

        if (activeTab === "latest") {
            queries.push(Query.orderDesc("$createdAt"));
        } else {
            queries.push(Query.orderDesc("views"));
        }

        const postsRes = await appwriteService.getPosts(queries);
        
        if (postsRes) {
            setPosts(postsRes.documents);
        }
    } catch (err) {
        console.log("Home Page Fetch Error:", err);
    } finally {
        setLoading(false);
    }
}, [activeTab]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="w-full py-8 min-h-screen bg-gray-50 dark:bg-black/10">
      <SEO 
          title="Home - Share Your Stories" 
          description="MegaBlog is a community for writers and readers. Read amazing articles on technology, lifestyle, and more."
          image="/pwa-192x192.png" // Logo as fallback image for sharing
          url={window.location.origin}
          type="website"
      />
      <Container>
        <div className="relative rounded-3xl p-6 md:p-12 mb-10 overflow-hidden shadow-xl border border-white/20 isolate">
          {/* Shared Glass Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-95 -z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-20 -z-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 text-white">
            {authStatus ? (
              //  VIEW 1: LOGGED IN USER
              <>
                <div className="max-w-none">
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                    Welcome back,{" "}
                    <span className="text-indigo-200">
                      {userData?.name || "Writer"}
                    </span>
                    ! 👋
                  </h1>
                  <p className="text-indigo-100/90 text-base md:text-lg leading-relaxed">
                    Ready to share your next big idea? Your readers are waiting.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-8">
                  <Button
                    onClick={() => navigate("/add-post")}
                   className="bg-indigo-800/40 text-white hover:bg-indigo-800/60 border border-white/20 px-6 py-3 font-medium shadow-lg backdrop-blur-md w-full sm:w-auto flex justify-center items-center rounded-xl text-sm md:text-base"
                  >
                    <PenTool size={18} strokeWidth={2.5} /> Write Post
                  </Button>
                  <Button
                    onClick={() => navigate("/all-posts")}
                    className="bg-indigo-800/40 text-white hover:bg-indigo-800/60 border border-white/20 px-6 py-3 font-medium shadow-lg backdrop-blur-md w-full sm:w-auto flex justify-center items-center rounded-xl text-sm md:text-base"
                  >
                    Explore Feed <ArrowRight size={18} className="ml-1" />
                  </Button>
                </div>
              </>
            ) : (
              //  VIEW 2: GUEST USER
              <>
                <div className="max-w-none">
                  <div className="flex items-center gap-2 mb-3 text-indigo-200 font-medium text-sm uppercase tracking-wider animate-in fade-in slide-in-from-left-4">
                    <Sparkles size={16} /> Discover & Write
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-1 tracking-tight leading-tight">
                    Share your stories with the{" "}
                    <span className="text-white underline decoration-pink-500 decoration-4 underline-offset-4">
                      world.
                    </span>
                  </h1>
                  <p className="text-indigo-100/90 text-base md:text-lg leading-relaxed max-w-none">
                    A modern platform for writers and readers. Join our
                    community to start your journey today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-8">
                  <Button
                    onClick={() => dispatch(openAuthModal("signup"))}
                    className="bg-indigo-900/40 text-white hover:bg-indigo-900/60 border border-white/20 px-8 py-3 font-medium shadow-lg w-full sm:w-auto rounded-xl backdrop-blur-md text-base"
                  >
                    Start Writing
                  </Button>
                  <Button
                    onClick={() => dispatch(openAuthModal("login"))}
                    className="bg-indigo-900/40 text-white hover:bg-indigo-900/60 border border-white/20 px-8 py-3 font-medium shadow-lg w-full sm:w-auto rounded-xl backdrop-blur-md text-base"
                  >
                    Login
                  </Button>
                </div>
              </>
            )}
          </div>{" "}
        </div>

        <div className="flex items-center gap-6 md:gap-8 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSearchParams({ tab: "trending" })}
            className={`pb-3 text-base md:text-lg font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
              activeTab === "trending"
                ? "text-orange-500"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Flame
              size={18}
              className={activeTab === "trending" ? "fill-orange-500" : ""}
            />
            Trending
            {activeTab === "trending" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full animate-in zoom-in"></span>
            )}
          </button>
          <button
            onClick={() => setSearchParams({ tab: "latest" })}
            className={`pb-3 text-base md:text-lg font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
              activeTab === "latest"
                ? "text-primary-light"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Clock size={18} /> Fresh Reads
            {activeTab === "latest" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light rounded-t-full animate-in zoom-in"></span>
            )}
          </button>
        </div>

        {/* --- POSTS GRID --- */}
        {loading ? (
            <PostGridSkeleton />
          ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {posts.map((post) => (
              <div
                key={post.$id}
                className="h-full transition-all duration-300 hover:shadow-xl rounded-xl"
              >
                <PostCard
                  {...post}
                  likes={post.likes || 0}
                  views={post.views || 0}
                  $createdAt={post.$createdAt}
                />
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              No posts found here yet.
            </h3>
            <p className="text-gray-500 mb-6 mt-2">
              Maybe you can start the trend?
            </p>
            {authStatus ? (
              <Button onClick={() => navigate("/add-post")}>
                Create First Post
              </Button>
            ) : (
              <Button onClick={() => dispatch(openAuthModal("signup"))}>
                Join to Write
              </Button>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default Home;
