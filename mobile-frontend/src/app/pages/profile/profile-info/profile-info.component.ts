import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-secondary ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css'
})
export class ProfileInfoComponent {

  user: any;
  restaurant: any;

  constructor(
    public router: Router
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser') || '{}');
    console.log(this.user,"user")
    this.restaurant = JSON.parse(localStorage.getItem('payoutUser') || '{}');
  }

  // logout() {
  //   this.authService.logout();
  //   window.location.reload(); // or use router.navigate(['/login']) if routing
  // }

  logout() {
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        icon: 'warning',
        confirmButtonText: 'Yes, Logout!',
        cancelButtonText: 'No',
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          localStorage.clear();
          this.router.navigate(['/auth/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }

  goToProfile(){
    this.router.navigate([('/dashboard/profile/profile-info')])
  }

}
