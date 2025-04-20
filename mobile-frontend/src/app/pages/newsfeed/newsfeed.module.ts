import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddNewsfeedComponent } from './add-newsfeed/add-newsfeed.component';
import { NewsfeedListComponent } from './newsfeed-list/newsfeed-list.component';
import { NewsfeedDetailsComponent } from './newsfeed-details/newsfeed-details.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
const routes: Routes = [
  {
    path: 'form',
    component: AddNewsfeedComponent,
  },
  {
    path: 'form/:id',
    component: AddNewsfeedComponent,
  },
  {
    path: 'list',
    component: NewsfeedListComponent,
  },

  // {
  //   path: 'details',
  //   component: NewsfeedDetailsComponent,
  // },

  {
    path: 'details/:id',
    component: NewsfeedDetailsComponent,
  },



]
export const NewsfeedRouting = RouterModule.forChild(routes);



@NgModule({
  declarations: [
    AddNewsfeedComponent,
    NewsfeedListComponent,
    NewsfeedDetailsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NewsfeedRouting
  ]
})
export class NewsfeedModule { }
