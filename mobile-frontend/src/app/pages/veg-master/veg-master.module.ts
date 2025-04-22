import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VegListComponent } from "./veg-list/veg-list.component";
import { CreateItemComponent } from "./create-item/create-item.component";
import { VegCardComponent } from "./veg-card/veg-card.component";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

const routes: Routes = [
  {
    path: "list",
    component: VegListComponent,
  },
  {
    path: "form",
    component: CreateItemComponent,
  },
  {
    path: "form/:id",
    component: CreateItemComponent,
  },
];

export const vegMasterRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [VegListComponent, CreateItemComponent, VegCardComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule,   NgSelectModule, vegMasterRouting],
})
export class VegMasterModule {}
