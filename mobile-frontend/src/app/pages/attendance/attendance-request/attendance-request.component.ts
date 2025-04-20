import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { AttendanceService } from '../attendance.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-attendance-request',
  templateUrl: './attendance-request.component.html',
  styleUrls: ['./attendance-request.component.css']
})
export class AttendanceRequestComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  requestForm: FormGroup;
  id: any;
  employeeId: any;
  user: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private attendanceService: AttendanceService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.employeeId = this.user?.employee?.id;
    this.breadCrumbItems = [
      { label: "Attendance" },
      { label: "Attendance Request", active: true },
    ];

    this.requestForm = this.fb.group({
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      action: ['', [Validators.required]],
    });
  }
  onSubmit() {
    if (this.requestForm.invalid) {
      return;
    }
    const requestData = this.requestForm.value;
    const requestObj = {
      date: requestData.date,
      time: requestData.time,
      action: requestData.action,
      status: requestData.status = '3',
      employeeId: this.employeeId,
    };
    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the request?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.attendanceService.updateRequest(this.id, requestObj)).subscribe(() => {
              this.router.navigate(["/attendance/requestList"]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the request?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.attendanceService.attendanceRequest(requestObj)).subscribe(() => {
              this.router.navigate(["/attendance/requestList"]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/attendance/requestList"]);
  }
}
