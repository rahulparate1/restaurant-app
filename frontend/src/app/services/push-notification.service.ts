import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  messaging: any;

  constructor(private apiService: ApiService) {
     // 👉 Log Firebase config here
     console.log('Firebase config:', environment.firebaseConfig);
    const app = initializeApp(environment.firebaseConfig);
    this.messaging = getMessaging(app);
  }

  /**
   * Initializes Firebase Cloud Messaging after the service worker is registered.
   * @param registration The active service worker registration.
   */
  // initFCM(registration: ServiceWorkerRegistration) {
  //   try {
  //     console.log('💬 Initializing FCM with registration:', registration);

  //     const vapidKey = (environment.firebaseConfig as any).vapidKey;

  //     getToken(this.messaging, {
  //       vapidKey,
  //       serviceWorkerRegistration: registration // ✅ provide this!
  //     }).then((token) => {
  //       if (token) {
  //         console.log('✅ FCM Token:', token);
  //       } else {
  //         console.warn('⚠️ No registration token available.');
  //       }
  //     }).catch(err => {
  //       console.error('❌ An error occurred while retrieving token.', err);
  //     });
  //   } catch (err) {
  //     console.error('❌ initFCM error', err);
  //   }
  // }

  /**
   * Sets up a listener for incoming foreground messages.
   */
  // listen(): void {
  //   onMessage(this.messaging, payload => {
  //     console.log('🔔 Message received: ', payload);
  //     alert(`${payload.notification?.title}\n${payload.notification?.body}`);
  //   });
  // }

//   initFCM(registration: ServiceWorkerRegistration): void {
//     try {
//       const vapidKey = (environment.firebaseConfig as any).vapidKey;
// console.log("vapidKey==>", vapidKey)
//       if (!vapidKey) {
//         console.error('❌ Missing VAPID key in Firebase config');
//         return;
//       }
//       getToken(this.messaging, {
//         vapidKey,
//         serviceWorkerRegistration: registration
//       }).then(token => {
//         if (token) {
//           console.log('✅ FCM Token:', token);
//           this.sendTokenToBackend(token);
//         } else {
//           console.warn('⚠️ No registration token available.');
//         }
//       }).catch(err => {
//         console.error('❌ Error retrieving FCM token:', err);
//       });
//     } catch (err) {
//       console.error('❌ initFCM error:', err);
//     }
//   }
initFCM(registration: ServiceWorkerRegistration): void {
  try {
    const vapidKey = (environment.firebaseConfig as any).vapidKey;
    console.log('🧾 VAPID Key:', vapidKey);

    if (!vapidKey) {
      console.error('❌ Missing VAPID key in Firebase config');
      return;
    }

    getToken(this.messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    }).then(token => {
      if (token) {
        console.log('✅ Received FCM Token:', token);
        this.sendTokenToBackend(token);
      } else {
        console.warn('⚠️ No registration token available');
      }
    }).catch(err => {
      console.error('❌ Error retrieving FCM token:', err);
    });

  } catch (err) {
    console.error('❌ initFCM unexpected error:', err);
  }
}

  /**
   * Sends the FCM token to your backend using the ApiService.
   */
  private sendTokenToBackend(token: string): void {
    this.apiService.commonGet(`users/set-push-token/${token}`)
      .then(response$ => {
        response$.subscribe({
          next: () => console.log('🔐 Token sent to backend successfully'),
          error: (err) => console.error('❌ Failed to send token to backend', err)
        });
      })
      .catch(err => {
        console.error('❌ Error during token send preparation:', err);
      });
  }

  /**
   * Listens for foreground push notifications.
   */
  // listen(): void {
  //   onMessage(this.messaging, (payload) => {
  //     console.log('🔔 Message received:', payload);
  //     alert(`${payload.notification?.title}\n${payload.notification?.body}`);
  //   });
  // }
  listen(): void {
    onMessage(this.messaging, payload => {
      console.log('🔔 Foreground push notification received:', payload);
      alert(`${payload.notification?.title}\n${payload.notification?.body}`);
    });
  }
}
