import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";


@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})

/**
 * Topbar component
 */
export class TopbarComponent {
 constructor(public router: Router) {}

  ngOnInit(): void {}



  goToProfile() {
    this.router.navigate(["/dashboard/profile/profile-info"]);
  }
}
