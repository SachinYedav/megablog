import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Clock, Bookmark, Trash2, X } from "lucide-react";
import { Button, Skeleton } from "../index"; 
import appwriteService from "../../appwrite/config";
import toast from "react-hot-toast";

export default function ContentListTab({ type, fetchData, clearAll, removeItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const navigate = useNavigate();
  const POST_LIMIT = 10; 

  const loadData = useCallback(async (pageNum = 1) => {
      if (pageNum === 1) setLoading(true); else setMoreLoading(true);
      try {
          const newItems = await fetchData(pageNum, POST_LIMIT);
          if (newItems.length < POST_LIMIT) setHasMore(false); else setHasMore(true);
          if (pageNum === 1) setItems(newItems); else setItems(prev => [...prev, ...newItems]);
      } catch (error) { toast.error("Could not load items"); } 
      finally { setLoading(false); setMoreLoading(false); }
  }, [fetchData]);

  useEffect(() => { loadData(1); }, [loadData]);

  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
  };

  const handleDelete = (e, id) => {
     e.preventDefault(); e.stopPropagation();
     setItems(prev => prev.filter(item => (item.historyId !== id && item.bookmarkId !== id)));
     removeItem(id);
  };

  const isHistory = type === "history";
  const TitleIcon = isHistory ? Clock : Bookmark;
  const EmptyIcon = isHistory ? Clock : Bookmark;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-right-4">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200"><TitleIcon size={18} /> {isHistory ? "Recently Viewed" : "Saved Posts"}</h3>
        {isHistory && items.length > 0 && (
           <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full transition-colors"><Trash2 size={12} /> Clear All</button>
        )}
      </div>

      {loading ? (
        <div className="p-6 space-y-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="flex gap-4 items-center">
                <Skeleton height="56px" width="56px" className="rounded-lg shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton height="16px" width="70%" /><Skeleton height="12px" width="40%" /></div>
             </div>
           ))}
        </div>
      ) : items.length > 0 ? (
        <>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, i) => (
                <Link to={`/post/${item.$id}`} key={`${i}-${item.$id}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative">
                <div className="flex justify-between items-center pr-8">
                    <div className="flex gap-4 items-center overflow-hidden">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200 dark:border-gray-700">
                        {item.featuredImage ? <img src={appwriteService.getFilePreview(item.featuredImage)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>}
                    </div>
                    <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-light transition-colors text-sm sm:text-base">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            {isHistory ? "Viewed" : "Saved"} on {new Date(item.visitedAt || item.savedAt).toLocaleDateString()}
                        </p>
                    </div>
                    </div>
                </div>
                <button onClick={(e) => handleDelete(e, isHistory ? item.historyId : item.bookmarkId)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"><X size={18} /></button>
                </Link>
            ))}
            </div>
            {hasMore && (
                <div className="p-4 flex justify-center border-t border-gray-100 dark:border-gray-800">
                    <Button onClick={handleLoadMore} disabled={moreLoading} bgColor="bg-gray-100 dark:bg-gray-800" textColor="text-gray-900 dark:text-white" className="text-sm px-6 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full">
                        {moreLoading ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </>
      ) : (
        <div className="p-10 text-center">
           <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 text-gray-400"><EmptyIcon size={24} /></div>
           <h4 className="text-gray-900 dark:text-white font-bold">{isHistory ? "No history yet" : "No bookmarks yet"}</h4>
           <Button className="mt-4" onClick={() => navigate("/all-posts")}>Start Reading</Button>
        </div>
      )}
    </div>
  );
}