import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ExitProcessService } from 'src/app/pages/exit-process/exit-process.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeManagementService } from 'src/app/pages/employee-management/employee-management.service';
import { FormGroup } from '@angular/forms';
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
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent {
  id: string;
  commentForm: FormGroup;
  data: any;
  exitDocuments: any;
  user: any;
  designation: any;
  employee: any;
  employeeData: any[] = [];
  employeeDetails: any;
  firstName: any;
  lastName: any;
  mobileNo: any;
  exitProcessId: any;
  constructor(
    private service: ExitProcessService,
    public router: Router,
    private activeRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.designation;
    this.id = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.getEmployeeDetails();
  }


   // Fetch employee details
   async getEmployeeDetails() {
    (await this.employeeService.getEmployeeView1()).subscribe((res: any) => {
      this.employeeDetails = res;
      this.firstName = this.employeeDetails.basicDetails.firstName;
      this.lastName = this.employeeDetails.basicDetails.lastName;
      this.mobileNo = this.employeeDetails.basicDetails.mobileNo;
      this.exitProcessId =this.employeeDetails.exitProcessId;
    });
  }



  // Set the current year
  year: number = new Date().getFullYear();
  currentSection = 'home';

  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
      navbar.classList.add('nav-sticky')
    } else {
      navbar.classList.remove('nav-sticky')
    }
  }

  toggleMenu() {
    document.getElementById('topnav-menu-content').classList.toggle('show');
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

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
          this.router.navigate(['']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }


  navagatToDocuments(id) {
    this.router.navigate(['exit/documents/'+ id]);
  }

}
