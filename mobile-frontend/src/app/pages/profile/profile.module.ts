import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'profile-info',
    component: ProfileInfoComponent,
  },

];

export const profileRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    ProfileInfoComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    profileRouting
  ]
})
export class ProfileModule { }
