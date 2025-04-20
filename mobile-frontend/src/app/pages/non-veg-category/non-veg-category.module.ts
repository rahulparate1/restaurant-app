import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'form',
    component: FormComponent,
  },
  {
    path: 'form/:id',
    component: FormComponent,
  },
];

export const nonvegCategoryRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [ListComponent, FormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    nonvegCategoryRouting,
  ],
})
export class NonVegCategoryModule {}
