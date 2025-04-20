import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsComponent } from './documents/documents.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';

const routes: Routes = [
  {
    path: 'documents/:id', component:DocumentsComponent ,
  },
  {
    path: 'profile', component: EmployeeProfileComponent ,
  },
]
export const exitRouting = RouterModule.forChild(routes)
@NgModule({
  declarations: [
    DocumentsComponent,
    EmployeeProfileComponent
  ],
  imports: [
    CommonModule,
    NgbNavModule,
    NgbTooltipModule,
    exitRouting
  ]
})
export class ExitDocumentsModule { }
