import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 1. Singleton App Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Auth Instance
const auth = getAuth(app);

// 3. Messaging Instance 
let messaging = null;

if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  try {
    messaging = getMessaging(app);
    console.log("✅ Firebase Messaging Initialized");
  } catch (err) {
    console.error("❌ Firebase Messaging Failed:", err);
  }
}

// 4. Helper: Get Token (With Logging)
export const requestFcmToken = async () => {
  try {
    if (!messaging) return null;
    
    // Permission maango
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🚫 Notification Permission Denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    
    console.log("🪙 FCM Token:", token ? "Generated" : "Failed");
    return token;
  } catch (error) {
    console.error("❌ Token Error:", error);
    return null;
  }
};

// 5. Helper: Foreground Listener 
export const onForegroundMessage = () => {
  return new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("🔥 MESSAGE CAUGHT IN FIREBASE.JS:", payload);
      resolve(payload);
    });
  });
};

export { app, auth, messaging };