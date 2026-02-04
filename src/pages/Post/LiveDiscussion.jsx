import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { openAuthModal } from "../../store/authSlice";
import chatService from "../../appwrite/chat";
import appwriteService from "../../appwrite/config";
import conf from "../../conf/conf";
import { Send, MessageSquare, Lock, Trash2, AlertTriangle, MessageCircle  } from "lucide-react";
import UserAvatar from "../../components/ui/UserAvatar";
import {Modal} from "../../components/index"

export default function LiveDiscussion({ articleId }) {
    const userData = useSelector((state) => state.auth.userData);
    
    const [chatRoom, setChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [senderProfiles, setSenderProfiles] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    //  Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, msgId: null });
    
    const scrollRef = useRef(null);
    const dispatch = useDispatch();

    // 1. Join Room
    useEffect(() => {
        let unsubscribe;
        const initChat = async () => {
            try {
                const room = await chatService.getArticleChat(articleId);
                if (room) {
                    setChatRoom(room);
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
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        if (articleId) initChat();
        return () => { if(unsubscribe) unsubscribe(); };
    }, [articleId]);

    // 2. Sync Profiles
    useEffect(() => {
        const uniqueSenders = [...new Set(messages.map(m => m.senderId))];
        uniqueSenders.forEach(async (userId) => {
            if (senderProfiles[userId] || (userData && userData.$id === userId)) return;
            try {
                const profile = await appwriteService.getUserProfile(userId);
                if (profile) setSenderProfiles(prev => ({ ...prev, [userId]: { name: profile.name, avatarId: profile.avatarId } }));
            } catch (e) {}
        });
    }, [messages, userData]); 

   useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
}, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userData || !chatRoom) return;
        const text = newMessage;
        setNewMessage("");
        await chatService.sendMessage({
            chatId: chatRoom.$id, senderId: userData.$id, text: text,
            senderName: userData.name, senderAvatar: userData.prefs?.avatarId || userData.avatarId
        });
    };

    //  Confirm Delete
    const confirmDelete = async () => {
        if (!deleteModal.msgId) return;
        const idToDelete = deleteModal.msgId;
        setDeleteModal({ isOpen: false, msgId: null });
        setMessages(prev => prev.filter(m => m.$id !== idToDelete));
        await chatService.deleteMessage(idToDelete);
    };

    if (loading) return <div className="h-40 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse" />;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm mt-10 relative" id="live-discussion">
            
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <MessageSquare size={18} className="text-green-500" /> Live Discussion
                </h3>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
            </div>

            {/* Messages */}
            <div className="h-[300px] overflow-y-auto p-4 bg-chat-pattern space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center">
                        <p>No discussion yet.</p><p>Be the first to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = userData && msg.senderId === userData.$id;
                        const displayName = isMe ? userData.name : (senderProfiles[msg.senderId]?.name || msg.senderName);
                        const displayAvatar = isMe ? (userData.prefs?.avatarId || userData.avatarId) : (senderProfiles[msg.senderId]?.avatarId || msg.senderAvatar);

                        return (
                            <div key={msg.$id} className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                <UserAvatar name={displayName || "User"} fileId={displayAvatar} className="w-8 h-8 text-xs" />
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">{displayName || "User"}</span>
                                    <div className={`group relative px-3 py-2 rounded-xl text-sm shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none text-gray-800 dark:text-gray-200"}`}>
                                        <p className="leading-snug break-words">{msg.text}</p>
                                        <p className={`text-[9px] mt-1 text-right opacity-70 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                        
                                        {isMe && (
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, msgId: msg.$id })}
                                                className="absolute -left-8 top-2 p-1 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
            {userData ? (
                <form onSubmit={handleSend} className="p-3 bg-gray-50 dark:bg-gray-800 flex gap-2 border-t border-gray-100 dark:border-gray-700">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Join the discussion..." className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none dark:text-white" />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-2 rounded-lg"><Send size={18} /></button>
                </form>
            ) : (
               <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Join the Discussion</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                    Sign in to chat with other readers in real-time.
                </p>
                
                {/*  BUTTON UPDATE */}
                <button 
                    onClick={() => dispatch(openAuthModal("login"))}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all shadow-md active:scale-95"
                >
                    Sign Up / Login
                </button>
            </div>
            )}

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, msgId: null })}
                title="Delete Message?"
                actionLabel="Delete"
                onAction={confirmDelete}
                isDanger
                confirmationText={null} 
            >
            <p className="text-sm text-gray-600 dark:text-gray-300">
                This action cannot be undone. The message will be removed for everyone.
            </p>
            </Modal>

        </div>
    );
}