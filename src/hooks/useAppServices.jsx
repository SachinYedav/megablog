import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

// Services
import authService from "../appwrite/auth";
import appwriteService from "../appwrite/config";
import { login, logout } from "../store/authSlice";
import { notificationSound } from "../conf/conf";
import { messaging, requestFcmToken } from "../firebase";
import { onMessage } from "firebase/messaging";

// --- 1. Audio Logic ---
const audioInstance = new Audio(notificationSound());
audioInstance.preload = "auto";

export const useAudioUnlock = () => {
  useEffect(() => {
    const unlockAudio = () => {
      audioInstance.play().then(() => {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }).catch(() => {});
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  const playSound = useCallback(() => {
    audioInstance.currentTime = 0;
    audioInstance.volume = 1.0;
    audioInstance.play().catch(e => console.warn("🔊 Audio blocked"));
  }, []);

  return { playSound };
};

// --- 2. Network Logic ---
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      toast.success("Back Online! 🚀", { id: "net-status" });
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
      toast.error("You are offline. Read-only mode.", { id: "net-status", duration: 5000 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, showBackOnline };
};

// --- 3. Auth Session Logic ---
export const useAuthSession = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        if (user) {
          let userProfile = null;
          try { 
              userProfile = await appwriteService.getUserProfile(user.$id); 
          } catch(e) {
              console.warn("⚠️ Profile Fetch Failed");
          }
          
          if(!userProfile) {
             const nameToUse = user.name && user.name.length > 0 ? user.name : "User";
             try { 
                 userProfile = await appwriteService.createUserProfile({ 
                     userId: user.$id, 
                     name: nameToUse, 
                     email: user.email 
                 }); 
             } catch(e) {}
          }

          dispatch(login({ 
            userData: { 
                ...user, 
                avatarId: userProfile?.avatarId, 
                prefs: { ...user.prefs, avatarId: userProfile?.avatarId } 
            } 
          }));
        } else {
          if (navigator.onLine) {
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error("❌ Session Check Error:", error);
        if(navigator.onLine) dispatch(logout());
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, [dispatch]);

  return { loading };
};


// --- 4. Push Notification Logic ---
export const usePushNotifications = (isOnline, playSound) => {
  const [incomingMessage, setIncomingMessage] = useState(null);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const isPushInitialized = useRef(false);
  const isListenerAttached = useRef(false);

  useEffect(() => {
    if (!userData || !isOnline || !messaging) return;
    if (!('serviceWorker' in navigator)) return;

    // Initialization Lock
    if (isPushInitialized.current) return;
    isPushInitialized.current = true;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
         console.log("⚙️ SW Scope:", reg.scope);
      });
    }

    const initPushSystem = async () => {
        try {
            await navigator.serviceWorker.ready;
            const token = await requestFcmToken();
            if (token) {
                await authService.createPushTarget(token);
            }
        } catch (e) {
            console.warn("Push Init Deferred:", e.message);
        }
    };
    
    // Call init safely
    initPushSystem();

    // Listener Logic
    if (isListenerAttached.current) return;
    isListenerAttached.current = true;

    const unsubscribe = onMessage(messaging, (payload) => {
        console.log("🔥 Foreground Message Received:", payload); 

        const notification = payload.notification || {};
        const data = payload.data || {};
        const finalTitle = notification.title || data.title || data.custom_title || "Notification";
        const finalBody = notification.body || data.body || data.message || data.custom_body || "New update received";
        const finalImage = notification.image || data.image || data.custom_image || null;
        const avatarUrl = data.sender_avatar || data.senderAvatar || data.icon || "/icons/logo.png";
        const linkUrl = data.click_action || data.link || data.url || '/';

        const msg = {
            id: Date.now(),
            title: finalTitle,
            body: finalBody,
            image: finalImage,
            avatar: avatarUrl, 
            link: linkUrl,
        };
        setIncomingMessage(msg);
    });

    return () => {
        isListenerAttached.current = false;
        unsubscribe();
    };
  }, [userData, isOnline]);

  // Handle Toast Display
  useEffect(() => {
    if (!incomingMessage) return;
    try { playSound(); } catch(e) {}

    toast.custom((t) => (
      <div 
        className={`${t.visible ? "animate-in slide-in-from-right-5 fade-in" : "animate-out slide-out-to-right-0 fade-out"} pointer-events-auto`}
        style={{
            zIndex: 99999999,
            background: "#0f172a", 
            border: "1px solid #334155",
            color: "white",
            padding: "16px", 
            borderRadius: "16px", 
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column", 
            gap: "12px",
            minWidth: "340px",
            maxWidth: "400px",
            cursor: "pointer"
        }}
        onClick={() => { 
            toast.dismiss(t.id); 
            if (incomingMessage.link && incomingMessage.link !== '/') navigate(incomingMessage.link);
        }} 
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
            <div style={{ flexShrink: 0 }}>
               <img 
                 src={incomingMessage.avatar} 
                 alt="Icon" 
                 style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid #475569" }} 
                 onError={(e) => e.target.src = "/icons/logo.png"} 
               />
            </div>
            <div style={{ flex: 1 }}>
               <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", lineHeight: "1.2" }}>{incomingMessage.title}</h4>
               <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: "1.4" }}>{incomingMessage.body}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", marginTop: "-4px" }}>
                <X size={18} />
            </button>
        </div>
        {incomingMessage.image && (
            <div style={{ width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", marginTop: "4px" }}>
                <img 
                    src={incomingMessage.image} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    alt="Attachment" 
                />
            </div>
        )}
      </div>
    ), { duration: 6000, position: "top-right" });

  }, [incomingMessage, playSound, navigate]);
};