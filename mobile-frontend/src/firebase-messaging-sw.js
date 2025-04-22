// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker with your actual config
firebase.initializeApp({
  apiKey: "AIzaSyDPdgXPQP2jvJPH2EGQdT_u-LX3uGSKC_8",
  authDomain: "testpayops-c06b3.firebaseapp.com",
  projectId: "testpayops-c06b3",
  messagingSenderId: "676197848344",
  appId: "1:676197848344:web:a1ab51128950fb32a6fa6d",
  vapidKey: "BEvoR4oltGZxEnawrYHSC3fdUSnGld3hi1rwOnuoVtQkjE9RummFlxKe8NrBz0tbDUnOoQPlTuc1BWSsnPporJg"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: '/assets/icons/icon-96x96.png' // Make sure this icon path exists
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});