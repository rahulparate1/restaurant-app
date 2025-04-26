import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

/**
 * Footer component
 */
export class FooterComponent implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();

 constructor(public router: Router) {}

  ngOnInit(): void {}



  goToProfile() {
    this.router.navigate(["/dashboard/profile/profile-info"]);
  }

  goToMenu() {
    this.router.navigate(["/dashboard/tab"]);
  }

  goToHome() {
    this.router.navigate(["/dashboard"]);
  }

  goToCart(){
    this.router.navigate(["/dashboard/cart/list"])
  }

  goToFeedback(){
    this.router.navigate(["/dashboard/feedback/form"]);
  }

}
