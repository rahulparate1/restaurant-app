import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    public router: Router
  ) { }


  goToProfile(){
    this.router.navigate([('/dashboard/profile/profile-info')])
  }
}
