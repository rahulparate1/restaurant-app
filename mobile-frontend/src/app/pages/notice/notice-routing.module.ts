import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNoticeComponent } from './create-notice/create-notice.component';
import { NoticeDetailsComponent } from './notice-details/notice-details.component';

const routes: Routes = [
  {
    path:"create-notice", component:CreateNoticeComponent
  },
  {
    path:"create-notice/:id", component:CreateNoticeComponent
  },
  {
    path:"notice-details/:id", component:NoticeDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeRoutingModule { }
