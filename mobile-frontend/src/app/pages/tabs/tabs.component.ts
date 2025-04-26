import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.component.html",
  styleUrl: "./tabs.component.css",
})
export class TabsComponent {

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onSubmit() {}

  goToProfile() {
    this.router.navigate(["/dashboard/profile/profile-info"]);
  }

  goToVegList(){
    this.router.navigate([('/dashboard/veg-master/list')])
  }

  goToNonVegList(){
    this.router.navigate([('/dashboard/non-veg-master/list')])
  }
}
