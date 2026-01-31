import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ============================================================
    //  PWA CONFIGURATION 
    // ============================================================
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
          "icons/favicon.ico", 
          "icons/apple-touch-icon.png", 
          "icons/logo.png", 
          "icons/badge-logo.png" 
      ],

      // ----------------------------------------------------------
      // 1. MANIFEST SETTINGS (App Metadata)
      // ----------------------------------------------------------
      manifest: {
        name: "MegaBlog - Share Your Story",
        short_name: "MegaBlog",
        description: "A modern platform to share your thoughts and connect with readers.",
        theme_color: "#121212",
        background_color: "#121212",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        
        //  FIREBASE ID 
        gcm_sender_id: "103953800507", 

        icons: [
          {
            src: "/icons/pwa-192x192.png",  
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/pwa-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
        ],
         badge: "/icons/badge-logo.png"
      },

      // ----------------------------------------------------------
      // 2. WORKBOX STRATEGIES (Caching Logic)
      // ----------------------------------------------------------
      workbox: {
        globIgnores: ["**/firebase-messaging-sw.js"],
        navigateFallback: '/index.html',
        runtimeCaching: [
          // A. Appwrite Images (Cache First / StaleWhileRevalidate)
          {
            urlPattern: /^https:\/\/cloud\.appwrite\.io\/.*\/files\/.*\/view/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "appwrite-images",
              expiration: {
                maxEntries: 100, 
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
              },
            },
          },

          // B. Appwrite API Data (Network First)
          {
            urlPattern: /^https:\/\/cloud\.appwrite\.io\/v1\/databases/,
            handler: "NetworkFirst",
            options: {
              cacheName: "appwrite-api-data",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 Day
              },
              networkTimeoutSeconds: 3, 
            },
          },

          // C. Static Assets & Fonts (Cache First)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
            },
          },
        ],
      },
    }),
  ],

  build: {
    sourcemap: false, 
  },

  // ============================================================
  //  SERVER CONFIGURATION
  // ============================================================
  server: {
    host: true, 
    port: 5173,
    strictPort: true,
  },
});