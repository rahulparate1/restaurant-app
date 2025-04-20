import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExitProcessListComponent } from './exit-process-list/exit-process-list.component';
import { ExitProcessFormComponent } from './exit-process-form/exit-process-form.component';
import { ExitProcessDetailsComponent } from './exit-process-details/exit-process-details.component';
import { ExitProcessService } from './exit-process.service';

const routes: Routes = [
    { path: 'list', component: ExitProcessListComponent ,canActivate: [ExitProcessService]},
    { path: 'form', component: ExitProcessFormComponent ,canActivate: [ExitProcessService]},
    { path: 'details/:id', component: ExitProcessDetailsComponent,canActivate: [ExitProcessService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExitProcessRoutingModule { }
