import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import conf from './conf/conf.js'; 

// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: conf.firebaseApiKey,
  authDomain: conf.firebaseAuthDomain,
  projectId: conf.firebaseProjectId,
  storageBucket: conf.firebaseStorageBucket,
  messagingSenderId: conf.firebaseMessagingSenderId,
  appId: conf.firebaseAppId,
};

// 2. SINGLETON APP INITIALIZATION
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 3. AUTH INSTANCE
const auth = getAuth(app);

// 4. MESSAGING INSTANCE 
let messaging = null;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error("❌ Firebase Messaging Init Failed:", err);
  }
}

// ============================================================
// 5. HELPER: REQUEST FCM TOKEN 
// ============================================================
export const requestFcmToken = async () => {
  try {
    if (!messaging) return null;

    // A. Permission Check
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🚫 Notification Permission Denied");
      return null;
    }

    // B. Service Worker Retrieval 
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
       console.error("❌ Service Worker not found. PWA might not be active.");
       return null;
    }

    // C. Token Generation
    const token = await getToken(messaging, {
      vapidKey: conf.firebaseVapidKey,
      serviceWorkerRegistration: registration, 
    });

    return token;

  } catch (error) {
    console.error("❌ Token Generation Failed:", error);
    return null;
  }
};

export { app, auth, messaging };