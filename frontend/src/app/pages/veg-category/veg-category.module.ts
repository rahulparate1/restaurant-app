import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { FormCategoryComponent } from './form/form-category.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'form',
    component: FormCategoryComponent,
  },
  {
    path: 'form/:id',
    component: FormCategoryComponent,
  },

];

export const vegCategoryRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    ListComponent,
    FormCategoryComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    vegCategoryRouting
  ]
})
export class VegCategoryModule { }
