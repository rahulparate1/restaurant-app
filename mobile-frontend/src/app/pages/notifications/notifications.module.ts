import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { RouterModule } from '@angular/router'; // ✅ Import this


@NgModule({
  declarations: [
    NotificationListComponent
  ],
  imports: [
    CommonModule,
    RouterModule, // ✅ Add this line
    NotificationsRoutingModule
  ]
})
export class NotificationsModule { }
