import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExplorerComponent } from "./explorer/explorer.component";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

const routes: Routes = [
  {
    path: "",
    component: ExplorerComponent,
  },
];

export const employeeRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [ExplorerComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    RouterModule.forChild(routes),
  ],
})
export class AiModule {}
