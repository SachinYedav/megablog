import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

// Services & Config
import authService from "./appwrite/auth";
import appwriteService from "./appwrite/config";
import { login, logout } from "./store/authSlice";
import { ThemeProvider } from "./context/ThemeContext";
import { notificationSound } from "./conf/conf";

// Components
import AppLayoutSkeleton from "./layouts/AppLayoutSkeleton";
import AuthModal from "./components/auth/AuthModal";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// Firebase 
import { messaging, requestFcmToken } from "./firebase"; 
import { onMessage } from "firebase/messaging";

// =================================================================
//  SINGLETON AUDIO INSTANCE 
// =================================================================
const audioInstance = new Audio(notificationSound());
audioInstance.preload = "auto";

function App() {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // State-Driven Notification
  const [incomingMessage, setIncomingMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const isListenerAttached = useRef(false);
  

  // ===============================================================
  // AUDIO SYSTEM
  // ===============================================================
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

  const playNotificationSound = () => {
      audioInstance.currentTime = 0;
      audioInstance.volume = 1.0;
      audioInstance.play().catch(e => console.warn("🔊 Audio blocked"));
  };

  // ===============================================================
  // 1. GLOBAL NETWORK MONITOR
  // ===============================================================
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back Online! 🚀", { id: "net-status" });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Read-only mode.", { id: "net-status", duration: 5000 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ===============================================================
  //  2. SESSION & PROFILE LOGIC 
  // ===============================================================
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        console.log("👤 Checking Session...");
        const user = await authService.getCurrentUser();
        
        if (user) {
          console.log("✅ User Found:", user.$id);
          
          let userProfile = null;
          try { 
              userProfile = await appwriteService.getUserProfile(user.$id); 
          } catch(e) {
              console.warn("⚠️ Profile Fetch Failed (New User?)");
          }
          
          if(!userProfile) {
             const nameToUse = user.name && user.name.length > 0 ? user.name : "User";
             try { 
                 userProfile = await appwriteService.createUserProfile({ 
                     userId: user.$id, 
                     name: nameToUse, 
                     email: user.email 
                 }); 
             } catch(e) {
                 console.error("Profile Create Error:", e);
             }
          }

          dispatch(login({ 
            userData: { 
                ...user, 
                avatarId: userProfile?.avatarId, 
                prefs: { ...user.prefs, avatarId: userProfile?.avatarId } 
            } 
          }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("❌ Session Check Error:", error);
        if(navigator.onLine) dispatch(logout());
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, []); 

  // ===============================================================
  // 3. NOTIFICATION LOGIC 
  // ===============================================================
  useEffect(() => {
    if (!userData || !isOnline || !messaging) return;
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
            console.log("⚙️ Service Worker Active:", reg.scope);
        });
    }

    const initPushSystem = async () => {
        const token = await requestFcmToken();
        if (token) {
            await authService.createPushTarget(token);
        }
    };
    initPushSystem();

    if (isListenerAttached.current) return;
    isListenerAttached.current = true;

    const unsubscribe = onMessage(messaging, (payload) => {
        const notification = payload.notification || {};
        const data = payload.data || {};
        const avatarUrl = data.sender_avatar || data.senderAvatar || data.icon || "/icons/logo.png";

        const msg = {
            id: Date.now(),
            title: notification.title || data.custom_title || "Notification",
            body: notification.body || data.custom_body || "You have a new message",
            image: data.custom_image || data.image || null,
            avatar: avatarUrl, 
            link: data.click_action || data.link || '/',
        };
        setIncomingMessage(msg);
    });

    return () => {
        isListenerAttached.current = false;
        unsubscribe();
    };
  }, [userData, isOnline]);

  // ===============================================================
  // 4. UI RENDERER 
  // ===============================================================
  useEffect(() => {
    if (!incomingMessage) return;
    playNotificationSound();

    toast.custom((t) => (
      <div 
        className={`${t.visible ? "animate-in slide-in-from-right-5 fade-in" : "animate-out slide-out-to-right-0 fade-out"} pointer-events-auto`}
        style={{
            zIndex: 99999999,
            background: "#0f172a", 
            border: "1px solid #334155",
            color: "white",
            padding: "14px",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            minWidth: "320px",
            maxWidth: "380px",
            cursor: "pointer"
        }}
        onClick={() => { 
            toast.dismiss(t.id); 
            if (incomingMessage.link && incomingMessage.link !== '/') navigate(incomingMessage.link);
        }} 
      >
        <div style={{ flexShrink: 0 }}>
           <img 
             src={incomingMessage.avatar} 
             alt="👤" 
             style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid #475569" }} 
             onError={(e) => e.target.src = "/icons/logo.png"} 
           />
        </div>
        <div style={{ flex: 1 }}>
           <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "bold" }}>{incomingMessage.title}</h4>
           <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: "1.4" }}>{incomingMessage.body}</p>
        </div>
        {incomingMessage.image && (
            <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                <img src={incomingMessage.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: "4px" }}>
            <X size={16} />
        </button>
      </div>
    ), { duration: 6000, position: "top-right" });

  }, [incomingMessage]);

  if (loading) return <AppLayoutSkeleton />;

  return (
    <ThemeProvider>
      <Toaster position="top-right" containerStyle={{ top: 20, right: 20, zIndex: 99999999 }} />
      <PWAInstallPrompt />
      {!isOnline && (
        <div className="bg-red-600 text-white text-xs text-center p-1 fixed top-0 w-full z-[100000] font-medium">
          You are currently offline
        </div>
      )}
      <AuthModal />
      <Outlet />
    </ThemeProvider>
  );
}

export default App;