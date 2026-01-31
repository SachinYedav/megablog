import React, { useState, useEffect } from "react";
import { X, Search, UserPlus, Trash2, Shield, Loader2, UserCheck } from "lucide-react";
import chatService from "../../appwrite/chat";
import UserAvatar from "../ui/UserAvatar";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {Modal} from "../index"; 

export default function ManageAccessModal({ isOpen, onClose, postId, chatId, ownerId }) {
    const currentUser = useSelector((state) => state.auth.userData);
    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isFetchingList, setIsFetchingList] = useState(true);
    
    const [userToRemove, setUserToRemove] = useState(null);

    // 1. FETCH LOGIC 
    useEffect(() => {
        const fetchDetails = async () => {
            setIsFetchingList(true);
            try {
                const chatDoc = await chatService.getChatFallback(chatId);
                const serverParticipants = chatDoc ? chatDoc.participants : [];
                const finalIds = [...new Set([ownerId, ...serverParticipants])];
                const res = await chatService.getChatProfiles(finalIds);
                
                const sorted = res.documents.sort((a, b) => 
                    a.userId === ownerId ? -1 : b.userId === ownerId ? 1 : 0
                );
                
                setParticipants(sorted);
            } catch (error) {
                console.error("Failed to load list", error);
                if(currentUser.$id === ownerId) {
                     setParticipants([{ userId: currentUser.$id, name: currentUser.name, avatarId: currentUser.prefs?.avatarId }]);
                }
            } finally {
                setIsFetchingList(false);
            }
        };

        if (isOpen && chatId) fetchDetails();
    }, [isOpen, chatId, ownerId]);

    //  2. Search Logic 
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearchLoading(true);
                try {
                    const res = await chatService.searchUsers(searchQuery);
                    setSearchResults(res.documents);
                } catch(e) { setSearchResults([]) }
                finally { setSearchLoading(false); }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // 3. Add/Remove Handler
    const handleUpdateAccess = async (targetUserId, type, userDetail = null) => {
        if (loading) return;

        if (type === 'add') {
            if (targetUserId === ownerId) return toast.error("Owner already has access.");
            if (participants.some(p => p.userId === targetUserId)) return toast.error("User is already added.");
        }

        setLoading(true);
        const toastId = toast.loading(type === 'add' ? "Adding..." : "Removing...");

        try {
            await chatService.manageCollaborator({
                type,
                chatId,
                entityId: postId,
                currentUserId: currentUser.$id,
                targetUserId
            });

            if (type === 'add' && userDetail) {
                setParticipants(prev => [...prev, userDetail]);
                setSearchResults(prev => prev.filter(u => u.userId !== targetUserId));
                setSearchQuery("");
            } else {
                setParticipants(prev => prev.filter(p => p.userId !== targetUserId));
            }
            
            toast.success(type === 'add' ? "Added!" : "Removed!", { id: toastId });
        } catch (error) {
            toast.error("Failed to update", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Confirm Removal
    const confirmRemove = async () => {
        if (!userToRemove) return;
        const id = userToRemove.userId;
        setUserToRemove(null); 
        await handleUpdateAccess(id, 'remove');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[600px] relative">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield size={18} className="text-green-600" /> Manage Access
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={20} className="text-gray-500"/></button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {/* SECTION 1: ADD PEOPLE */}
                    <div className="relative mb-8">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Add Collaborator</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search users by name..." 
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Search Dropdown */}
                        {searchQuery.length > 2 && (
                            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-xl mt-2 border border-gray-100 dark:border-gray-700 z-10 max-h-40 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="p-3 text-center text-xs text-gray-400">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => {
                                        const isAlreadyAdded = participants.some(p => p.userId === user.userId);
                                        const isOwner = user.userId === ownerId;
                                        return (
                                            <button 
                                                key={user.$id} 
                                                onClick={() => !isAlreadyAdded && !isOwner && handleUpdateAccess(user.userId, 'add', user)} 
                                                className={`w-full flex items-center justify-between p-3 transition-colors text-left ${isAlreadyAdded || isOwner ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar name={user.name} fileId={user.avatarId} className="w-6 h-6 text-[10px]" />
                                                    <span className="text-sm font-medium dark:text-gray-200">{user.name}</span>
                                                </div>
                                                {isAlreadyAdded || isOwner ? <UserCheck size={16} className="text-green-500"/> : <UserPlus size={16} className="text-gray-400" />}
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="p-3 text-center text-xs text-gray-400">No users found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: LIST OF PEOPLE */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">People with access</label>
                        {isFetchingList ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : (
                            <div className="space-y-3">
                                {participants.map(user => {
                                    const isOwner = user.userId === ownerId;
                                    return (
                                        <div key={user.$id} className="flex items-center justify-between group p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={user.name} fileId={user.avatarId} className="w-8 h-8 text-xs" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                        {user.name}
                                                        {isOwner && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Owner</span>}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">{isOwner ? "Admin" : "Editor"}</p>
                                                </div>
                                            </div>
                                            
                                            {currentUser.$id === ownerId && !isOwner && (
                                                <button 
                                                    onClick={() => setUserToRemove(user)}
                                                    disabled={loading}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                    title="Remove access"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-center">
                    <button onClick={onClose} className="text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Done</button>
                </div>

                {/*  GLOBAL MODAL FOR REMOVAL */}
                <Modal
                    isOpen={!!userToRemove}
                    onClose={() => setUserToRemove(null)}
                    title={`Remove ${userToRemove?.name}?`}
                    actionLabel="Remove"
                    onAction={confirmRemove}
                    isDanger={true}
                    loading={loading}
                    confirmationText={null} 
                >
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        They will lose access to edit this draft immediately.
                    </p>
                </Modal>

            </div>
        </div>
    );
}