import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonVegListComponent } from './non-veg-list/non-veg-list.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { NonVegCardComponent } from './non-veg-card/non-veg-card.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'list',
    component: NonVegListComponent,
  },
  {
    path: 'form',
    component: CreateItemComponent,
  },
  {
    path: 'form/:id',
    component: CreateItemComponent,
  },

];

export const nonvegMasterRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    NonVegListComponent,
    CreateItemComponent,
    NonVegCardComponent
  ],
  imports: [
    CommonModule,
    nonvegMasterRouting
  ]
})
export class NonVegMasterModule { }
