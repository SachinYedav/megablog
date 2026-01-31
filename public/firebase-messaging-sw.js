/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// =================================================================
// 1. CONFIGURATION
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBy6Cm2nkwxAgLmMmJGhK22R7Gxdl1GMe4",
  authDomain: "megablog-dca34.firebaseapp.com",
  projectId: "megablog-dca34",
  storageBucket: "megablog-dca34.firebasestorage.app",
  messagingSenderId: "192322056633",
  appId: "1:192322056633:web:98d4360e5424b914d4c668",
  measurementId: "G-1DNNQRRQKP"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// =================================================================
// BACKGROUND MESSAGE HANDLER
// =================================================================
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Payload Received:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  // 1. Title & Body
  const title = notification.title || data.custom_title || 'MegaBlog Update';
  const body = notification.body || data.custom_body || 'You have a new update.';
  const bigImage = data.custom_image || data.image || null; 
  const smallIcon = data.sender_avatar || data.senderAvatar || '/icons/pwa-192x192.png';
  // 3. Action URL
  const clickAction = data.click_action || '/';

  const notificationOptions = {
    body: body,
    icon: smallIcon, 
    image: bigImage, 
    badge: '/icons/badge-logo.png',
    data: { url: clickAction }, 
    tag: 'megablog-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
        { action: 'open_url', title: 'View Post' }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// =================================================================
// CLICK HANDLER (System Notification Click)
// =================================================================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // URL nikalna
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        const clientUrl = new URL(client.url, self.location.origin);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        
        // Check if origin matches
        if (clientUrl.hostname === targetUrl.hostname && 'focus' in client) {
            // Agar path alag hai to navigate karo
            if (clientUrl.pathname !== targetUrl.pathname) {
                return client.navigate(urlToOpen).then(c => c.focus());
            }
            return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});