import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from './services/push-notification.service';
import * as AOS from 'aos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private pushService: PushNotificationService, public router: Router) {}

  ngOnInit() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);

          // ✅ Now safe to init FCM
          this.pushService.initFCM(registration);
        })
        .catch(err => {
          console.error('❌ Service Worker registration failed:', err);
        });
    }

    AOS.init({
      duration: 1000, // animation duration
      once: true // whether animation should happen only once
    });
    }


      goToProfile(){
        this.router.navigate([('/dashboard/profile/profile-info')])
      }


}
