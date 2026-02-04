import React, { useEffect, useState } from "react";
import appwriteService from "../../appwrite/config";
import { PostCard, Skeleton } from "../../components";

function RelatedPosts({ currentPostId, currentUserId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await appwriteService.getRelatedPosts(
          currentPostId,
          currentUserId
        );
        if (res) {
          const uniquePosts = res.documents.reduce((acc, current) => {
            const x = acc.find((item) => item.$id === current.$id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          setPosts(uniquePosts);
        }
      } catch (error) {
        console.error("Related Posts Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentPostId) fetchRelated();
  }, [currentPostId, currentUserId]);

  if (loading)
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );

  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <div
          key={post.$id}
          className="w-full transition-transform hover:scale-[1.02] duration-200"
        >
          <PostCard
            {...post}
          />
        </div>
      ))}
    </div>
  );
}

export default RelatedPosts;
