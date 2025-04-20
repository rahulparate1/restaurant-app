import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePollsComponent } from './create-polls/create-polls.component';
import { PollsListComponent } from './polls-list/polls-list.component';
import { PollsDetailsComponent } from './polls-details/polls-details.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { PollsResultComponent } from './polls-result/polls-result.component';
import { MarkPollComponent } from './mark-poll/mark-poll.component';
const routes: Routes = [
  {
    path: 'create-poll',
    component: CreatePollsComponent,
  },
  {
    path: 'create-poll/:id',
    component: CreatePollsComponent,
  },
  {
    path: 'polls-list',
    component: PollsListComponent,
  },

  {
    path: 'poll-details',
    component: PollsDetailsComponent,
  },

    {
    path: 'poll-details/:id',
    component: PollsDetailsComponent,
  },

  {
    path: 'poll-result/:id',
    component: PollsResultComponent,
  },

  {
    path: 'mark-poll/:id',
    component: MarkPollComponent,
  }
]
  export const PollsRouting = RouterModule.forChild(routes);



@NgModule({
  declarations: [
    CreatePollsComponent,
    PollsListComponent,
    PollsDetailsComponent,
    PollsResultComponent,
    MarkPollComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    PollsRouting,
    UIModule,
    CarouselModule,
    SlickCarouselModule

  ],
  exports: [
    MarkPollComponent, // If needed in other modules
  ]
})
export class PollsModule { }
