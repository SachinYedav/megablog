import React from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

// Context & Store
import { ThemeProvider } from "./context/ThemeContext";

// Components
import AppLayoutSkeleton from "./layouts/AppLayoutSkeleton";
import AuthModal from "./components/auth/AuthModal";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import NetworkStatusBar from "./components/ui/NetworkStatusBar";

// Custom Hooks for App Services
import { 
  useAuthSession, 
  useNetworkStatus, 
  useAudioUnlock, 
  usePushNotifications 
} from "./hooks/useAppServices";

function App() {
  // 1. Auth & Session Logic
  const { loading } = useAuthSession();

  // 2. Network Logic
  const { isOnline, showBackOnline } = useNetworkStatus();

  // 3. Audio Logic
  const { playSound } = useAudioUnlock();

  // 4. Notifications Logic 
  usePushNotifications(isOnline, playSound);

  // Loading State
  if (loading) return <AppLayoutSkeleton />;

  return (
    <ThemeProvider>
      {/* Toast Configuration */}
      <Toaster position="top-right" containerStyle={{ top: 20, right: 20, zIndex: 99999999 }} />
      
      {/* PWA & System UI */}
      <PWAInstallPrompt />
      <NetworkStatusBar isOnline={isOnline} show={showBackOnline} />
      
      {/* Main App Layout */}
      <AuthModal />
      <Outlet />
    </ThemeProvider>
  );
}

export default App;