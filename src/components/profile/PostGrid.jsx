import React from "react";
import { Users, Trash2, Edit3, Pin, FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PostCard, Button } from "../index";
import PostGridSkeleton from "./skeletons/PostGridSkeleton";

export default function PostGrid({
  posts,
  loading,
  postsLoading,
  onDeleteClick, 
  onPinClick,    
  onEditClick,   
  readOnly = false,
}) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  
  if (loading || postsLoading) return <PostGridSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={24} className="text-primary-light" />
          {readOnly ? "Articles" : "My Articles"}
        </h2>
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
           {posts.length} Visible
        </span>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {posts.map((post) => {
            const isAuthor = userData && post.userId === userData.$id;

            return (
              <div key={post.$id} className="relative group h-full">
                <PostCard {...post} isPinned={post.isPinned} />

                {/* ACTION OVERLAY */}
                {!readOnly && (isAuthor || onEditClick) && (
                  <div className="absolute top-3 right-3 flex gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                    
                    {/* 1. PIN (Only Author) */}
                    {isAuthor && onPinClick && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPinClick(post); }} className={`p-2 rounded-lg shadow-lg backdrop-blur-md border border-white/10 ${post.isPinned ? "bg-yellow-400 text-black" : "bg-gray-900/80 text-white"}`} title={post.isPinned ? "Unpin" : "Pin"}>
                            <Pin size={16} className={post.isPinned ? "fill-current" : ""} />
                        </button>
                    )}

                    {/* 2. EDIT (Author OR Collaborator) */}
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if(onEditClick) onEditClick(post); // Priority to prop
                            else navigate(`/edit-post/${post.$id}`); 
                        }} 
                        className="p-2 bg-blue-600/90 text-white rounded-lg shadow-lg hover:bg-blue-700 backdrop-blur-md border border-white/10"
                        title="Edit / Collaborate"
                    >
                        <Edit3 size={16} />
                    </button>

                    {/* 3. DELETE (Only Author) */}
                    {isAuthor && onDeleteClick && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteClick(post); }} className="p-2 bg-red-600/90 text-white rounded-lg shadow-lg hover:bg-red-700 backdrop-blur-md border border-white/10">
                            <Trash2 size={16} />
                        </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center animate-in fade-in zoom-in">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4"><FileText size={40} className="text-gray-400 dark:text-gray-500" /></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No articles found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{readOnly ? "This user hasn't published any articles yet." : "You haven't written any articles yet."}</p>
          {!readOnly && <Button onClick={() => navigate("/add-post")} className="flex items-center gap-2"><PlusCircle size={18} /> Create First Article</Button>}
        </div>
      )}
    </div>
  );
}