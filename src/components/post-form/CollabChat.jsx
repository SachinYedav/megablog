import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import chatService from "../../appwrite/chat";
import appwriteService from "../../appwrite/config"; 
import conf from "../../conf/conf";
import { Send, MessageSquare, Loader2, X, Users, Trash2, AlertTriangle } from "lucide-react";
import UserAvatar from "../ui/UserAvatar";
import {Modal} from "../index";

export default function CollabChat({ postId, onClose }) {
    const userData = useSelector((state) => state.auth.userData);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [senderProfiles, setSenderProfiles] = useState({});
    
    //  Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, msgId: null });

    const scrollRef = useRef(null);
    const [chatId, setChatId] = useState(null);

    // 1. Join Room & Subscribe
    useEffect(() => {
        let unsubscribe;
        const initChat = async () => {
            try {
                let room = null;
                try {
                    room = await chatService.getCollabChat(postId, userData.$id, [userData.$id]);
                } catch (err) {
                    const fallbackId = `draft_${postId.substring(0, 30)}`;
                    room = await chatService.getChatFallback(fallbackId);
                }

                if (room) {
                    setChatId(room.$id);
                    const history = await chatService.getMessages(room.$id);
                    if(history) setMessages(history.documents.reverse());

                    unsubscribe = chatService.client.subscribe(
                        `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteCollectionMessagesId}.documents`,
                        (response) => {
                            if (response.events.includes("databases.*.collections.*.documents.*.create")) {
                                const newMsg = response.payload;
                                if(newMsg.chatId === room.$id) {
                                    setMessages(prev => {
                                        if (prev.some(m => m.$id === newMsg.$id)) return prev;
                                        return [...prev, newMsg];
                                    });
                                }
                            }
                            if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
                                setMessages(prev => prev.filter(m => m.$id !== response.payload.$id));
                            }
                        }
                    );
                }
            } catch (error) {
                console.error("Collab Chat Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (postId && userData) initChat();
        return () => { if(unsubscribe) unsubscribe(); };
    }, [postId, userData]);

    // 2. Sync Profiles
    useEffect(() => {
        const uniqueSenders = [...new Set(messages.map(m => m.senderId))];
        uniqueSenders.forEach(async (userId) => {
            if (senderProfiles[userId] || (userData && userData.$id === userId)) return;
            try {
                const profile = await appwriteService.getUserProfile(userId);
                if (profile) {
                    setSenderProfiles(prev => ({ ...prev, [userId]: { name: profile.name, avatarId: profile.avatarId } }));
                }
            } catch (e) {}
        });
    }, [messages]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    //  Confirm Delete Handler
    const confirmDelete = async () => {
        if (!deleteModal.msgId) return;
        const idToDelete = deleteModal.msgId;
        
        // UI Close
        setDeleteModal({ isOpen: false, msgId: null });
        
        setMessages(prev => prev.filter(m => m.$id !== idToDelete));
        
        try {
            await chatService.deleteMessage(idToDelete);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;
        const text = newMessage;
        setNewMessage("");
        await chatService.sendMessage({
            chatId: chatId, senderId: userData.$id, text: text,
            senderName: userData.name, senderAvatar: userData.prefs?.avatarId || userData.avatarId
        });
    };

    return (
        <div className="flex flex-col h-[500px] w-full bg-white dark:bg-gray-900 relative">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-2 rounded-lg">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-none">Team Chat</h3>
                        <p className="text-xs text-gray-500 mt-1">Real-time collaboration</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-pattern custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <Loader2 className="animate-spin" />
                        <span className="text-xs">Connecting...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-sm opacity-60">
                        <MessageSquare size={32} className="mb-2"/>
                        <p>No messages yet.</p>
                        <p className="text-xs">Start the discussion!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = userData && msg.senderId === userData.$id;
                        const displayName = isMe ? userData.name : (senderProfiles[msg.senderId]?.name || msg.senderName);
                        const displayAvatar = isMe ? (userData.prefs?.avatarId || userData.avatarId) : (senderProfiles[msg.senderId]?.avatarId || msg.senderAvatar);

                        return (
                            <div key={msg.$id} className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                <UserAvatar name={displayName} fileId={displayAvatar} className="w-8 h-8 text-[10px] shadow-sm" />
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">{displayName || "User"}</span>
                                    
                                    <div className={`group relative px-3 py-2 rounded-xl text-sm shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"}`}>
                                        <p className="leading-snug break-words">{msg.text}</p>
                                        <p className={`text-[9px] mt-1 text-right opacity-70 ${isMe?"text-indigo-200":"text-gray-400"}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                                        </p>

                                        {/* DELETE BUTTON  */}
                                        {isMe && (
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, msgId: msg.$id })}
                                                className="absolute -left-8 top-2 p-1 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                    <input className="flex-1 bg-transparent px-4 py-2 text-sm outline-none dark:text-white" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button type="submit" disabled={!newMessage.trim()} className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md transform active:scale-95"><Send size={16} /></button>
                </div>
            </form>

            {/*  Global Modal for Delete Confirmation */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, msgId: null })}
                title="Delete Message?"
                actionLabel="Delete"
                onAction={confirmDelete}
                isDanger={true}
                confirmationText={null} 
            >
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Are you sure you want to delete this message? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}