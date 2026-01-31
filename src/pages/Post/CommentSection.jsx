import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { openAuthModal } from "../../store/authSlice";
import appwriteService from "../../appwrite/config";
import conf from "../../conf/conf";
import {Modal} from "../../components/index"; 
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit2,
  Trash2,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  CornerDownRight
} from "lucide-react";
import toast from "react-hot-toast";

//  SINGLE COMMENT ITEM 
const CommentItem = ({ comment, allComments, userData, depth = 0, actions }) => {
  const [likes, setLikes] = useState(comment.likes || []);
  const [dislikes, setDislikes] = useState(comment.dislikes || []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyVal, setReplyVal] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();

  const isLiked = userData ? likes.includes(userData.$id) : false;
  const isDisliked = userData ? dislikes.includes(userData.$id) : false;
  const isOwner = userData?.$id === comment.userId;
  const children = allComments.filter((c) => c.parentId === comment.$id);


  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const getAvatar = async () => {
      if (userData && comment.userId === userData.$id) {
        if (userData.avatarId) setAuthorAvatar(appwriteService.getFilePreview(userData.avatarId));
        return;
      }
      try {
        const p = await appwriteService.getUserProfile(comment.userId);
        if (p?.avatarId) setAuthorAvatar(appwriteService.getFilePreview(p.avatarId));
      } catch (e) {}
    };
    if (comment.userId) getAvatar();
  }, [comment.userId, userData]);

  const handleReaction = async (type) => {
    if (!userData) {
        toast.error("Login to react", { icon: "🔒", style: { borderRadius: "10px", background: "#333", color: "#fff" } });
        dispatch(openAuthModal("login"));
        return;
    }
    const oldLikes = [...likes];
    const oldDislikes = [...dislikes];
    let newLikes = [...likes];
    let newDislikes = [...dislikes];

    if (type === "like") {
      if (isLiked) newLikes = newLikes.filter((id) => id !== userData.$id);
      else { newLikes.push(userData.$id); newDislikes = newDislikes.filter((id) => id !== userData.$id); }
    } else {
      if (isDisliked) newDislikes = newDislikes.filter((id) => id !== userData.$id);
      else { newDislikes.push(userData.$id); newLikes = newLikes.filter((id) => id !== userData.$id); }
    }
    setLikes(newLikes);
    setDislikes(newDislikes);
    try {
      await appwriteService.toggleReaction(conf.appwriteCommentsCollectionId, comment.$id, userData.$id, type, oldLikes, oldDislikes);
    } catch (e) {
      setLikes(oldLikes);
      setDislikes(oldDislikes);
      toast.error("Failed");
    }
  };

  return (
    <div className={`relative w-full ${depth > 0 ? "mt-2" : "mb-6"}`}>
      {depth > 0 && (
        <div className="absolute -left-[44px] -top-9 bottom-[calc(100%-20px)] w-6 border-l-2 border-b-2 border-gray-200 dark:border-gray-800 rounded-bl-xl pointer-events-none" />
      )}
      <div className="flex gap-4 relative z-10 group">
        <Link to={`/user/${comment.userId}`} className={`shrink-0 ${depth > 0 ? "w-8 h-8 mt-1" : "w-10 h-10"} rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-sm ring-2 ring-white dark:ring-gray-950`}>
          {authorAvatar ? <img src={authorAvatar} className="w-full h-full object-cover" alt="User" /> : comment.authorName?.[0]?.toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start h-6">
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer ${depth > 0 ? "text-xs" : "text-sm"}`}>@{comment.authorName}</span>
              <span className="text-[10px] text-gray-500">{new Date(comment.$createdAt).toLocaleDateString()}</span>
            </div>
            {userData && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <MoreVertical size={14} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-900 shadow-xl rounded-lg z-50 py-1 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-75 origin-top-right">
                    {isOwner ? (
                      <>
                        <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 flex gap-2 items-center text-gray-700 dark:text-gray-200"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => actions.delete(comment.$id)} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex gap-2 items-center"><Trash2 size={12} /> Delete</button>
                      </>
                    ) : (
                      <button onClick={() => actions.report(comment.$id)} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 flex gap-2 items-center text-gray-700 dark:text-gray-200"><Flag size={12} /> Report</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="mb-2 mt-1">
              <input value={editVal} onChange={(e) => setEditVal(e.target.value)} className="w-full border-b-2 border-black dark:border-white bg-transparent py-1 text-sm focus:outline-none" autoFocus />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="text-xs px-3 py-1.5 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">Cancel</button>
                <button onClick={async () => { await actions.edit(comment.$id, editVal); setIsEditing(false); }} className="text-xs px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition-colors">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          )}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => handleReaction("like")} className={`flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isLiked ? "text-blue-600" : "text-gray-500 dark:text-gray-400"}`}><ThumbsUp size={14} className={isLiked ? "fill-current" : ""} /><span className="text-xs font-medium">{likes.length || ""}</span></button>
              <button onClick={() => handleReaction("dislike")} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isDisliked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}><ThumbsDown size={14} className={isDisliked ? "fill-current" : ""} /></button>
              {depth < 3 && <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1 rounded-full transition-colors">Reply</button>}
            </div>
          )}
          {isReplying && (
            <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-600 overflow-hidden shrink-0">
                {userData?.avatarId ? <img src={appwriteService.getFilePreview(userData.avatarId)} className="w-full h-full object-cover" /> : userData?.name?.[0]}
              </div>
              <div className="flex-1 relative group/input">
                <input value={replyVal} onChange={(e) => setReplyVal(e.target.value)} className="w-full border-b border-gray-300 dark:border-gray-700 bg-transparent text-sm py-1.5 pr-10 focus:border-black dark:focus:border-white focus:outline-none transition-all placeholder-gray-500" placeholder="Add a reply..." autoFocus />
                <button onClick={async () => { await actions.reply(replyVal, comment.$id); setReplyVal(""); setIsReplying(false); }} disabled={!replyVal.trim()} className="absolute right-0 bottom-1.5 p-1.5 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:text-gray-300 disabled:hover:bg-transparent transition-all"><Send size={16} /></button>
              </div>
            </div>
          )}
          {children.length > 0 && (
            <div className="mt-2">
              {!showReplies ? (
                <button onClick={() => setShowReplies(true)} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors w-fit"><CornerDownRight size={14} /> {children.length} replies</button>
              ) : (
                <div className="pl-2">
                  {children.map((child) => <CommentItem key={child.$id} comment={child} allComments={allComments} userData={userData} depth={depth + 1} actions={actions} />)}
                  <button onClick={() => setShowReplies(false)} className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mt-2 flex items-center gap-1 font-bold ml-[-12px] px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-fit"><ChevronUp size={14} /> Show less</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//  MAIN SECTION COMPONENT
export default function CommentSection({ postId, authorId, postTitle, postImage }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  //  2. Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    appwriteService.getComments(postId).then((res) => {
      if (res) setComments(res.documents);
    });
  }, [postId]);

  //  3. Recursive Helper for UI Update 
  const getDescendantIds = (parentId, allComments) => {
    let ids = [parentId];
    const children = allComments.filter(c => c.parentId === parentId);
    children.forEach(child => {
      ids = [...ids, ...getDescendantIds(child.$id, allComments)];
    });
    return ids;
  };

  // 4. The Actual Delete Function 
  const handleDeleteConfirm = async () => {
    const id = deleteModal.commentId;
    if (!id) return;

    setIsDeleting(true);
    
    const idsToDelete = getDescendantIds(id, comments);
    const originalComments = [...comments]; 
    setComments((prev) => prev.filter((c) => !idsToDelete.includes(c.$id)));

    setDeleteModal({ isOpen: false, commentId: null }); 

    const success = await appwriteService.deleteComment(id);
    
    setIsDeleting(false);

    if (success) {
      toast.success("Comment deleted");
    } else {
      toast.error("Failed to delete");
      setComments(originalComments);
    }
  };

  const actions = {
    reply: async (content, parentId) => {
      if (!userData) {
        toast.error("Login to comment", { icon: "🔒", style: { borderRadius: "10px", background: "#333", color: "#fff" } });
        dispatch(openAuthModal("login")); 
        return;
      }
      if (!content.trim()) return;
      const c = await appwriteService.createComment({ content, postId, userId: userData.$id, authorName: userData.name, parentId });
      if (c) {
        setComments((prev) => [c, ...prev]);
        toast.success("Comment added");
        if (userData.$id !== authorId) {
          const actorAvatar = userData.avatarId || userData.prefs?.avatarId || null;
          appwriteService.sendNotification({ type: "comment", actorId: userData.$id, actorName: userData.name, actorAvatar, targetUserId: authorId, postId, postTitle: postTitle || "your post", postImage: postImage || null, messageContent: content });
        }
      }
    },
    edit: async (id, content) => {
      const u = await appwriteService.updateComment(id, content);
      setComments((p) => p.map((c) => (c.$id === id ? u : c)));
      toast.success("Updated");
    },
    delete: (id) => {
      setDeleteModal({ isOpen: true, commentId: id });
    },
    report: () => toast.error("Feature coming soon"),
  };

  const rootComments = comments.filter((c) => !c.parentId);
  const visibleComments = showAllComments ? rootComments : rootComments.slice(0, 3);

  return (
    <div className="mt-10 px-1" id="comments-section">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{comments.length} Comments</h3>
      </div>

      <div className="flex gap-4 mb-10 items-start">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden shrink-0">
          {userData?.avatarId ? <img src={appwriteService.getFilePreview(userData.avatarId)} className="w-full h-full object-cover" /> : userData?.name?.[0] || "U"}
        </div>
        <div className="flex-1 relative group">
          <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2.5 pr-12 focus:border-black dark:focus:border-white focus:outline-none transition-all placeholder-gray-500 text-sm font-medium" />
          {newComment.trim().length > 0 && (
            <button onClick={() => actions.reply(newComment, null).then(() => setNewComment(""))} className="absolute right-0 bottom-2 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 shadow-md transition-all active:scale-95"><Send size={16} className="ml-0.5" /></button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {visibleComments.map((c) => (
          <CommentItem key={c.$id} comment={c} allComments={comments} userData={userData} actions={actions} />
        ))}
      </div>

      {rootComments.length > 3 && (
        <button onClick={() => setShowAllComments(!showAllComments)} className="w-full py-2.5 mt-6 text-sm font-bold text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center gap-2">
          {showAllComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showAllComments ? "Show Less" : `Show ${rootComments.length - 3} more comments`}
        </button>
      )}

      {/* GLOBAL DELETE MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: null })}
        title="Delete Comment?"
        actionLabel="Delete"
        isDanger={true}
        onAction={handleDeleteConfirm}
        loading={isDeleting}
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure? This will also remove all <strong>nested replies</strong> permanently.
        </p>
      </Modal>
    </div>
  );
}