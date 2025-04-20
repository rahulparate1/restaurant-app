import { Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import { AttendanceService } from '../attendance.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-approve-timesheet',
  templateUrl: './approve-timesheet.component.html',
  styleUrls: ['./approve-timesheet.component.css']
})
export class ApproveTimesheetComponent {

  approvedForm: UntypedFormGroup;
  id: any;
  timesheetDetails: any;
  user: any;
  companyId: any;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: AttendanceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService,
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    // this.employeeId = this.user?.id;
    this.companyId = this.user?.companyId;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    console.log("this.id==>", this.id)

    this.getTimesheetDetails(this.id);
    this.approvedForm = this.formBuilder.group({
      comment: [''],
      effectiveHours: [0, Validators.required] // ✅ New field added for effective hours
    });
  }

  async getTimesheetDetails(id: any) {
    (await this.service.getTimesheetbyId(id)).subscribe((res: any) => {
      this.timesheetDetails = res;
      console.log("this.timesheetDetails==>", this.timesheetDetails)
    });
  }

  async updateStatus(id) {
    const comment = this.approvedForm.get('comment').value;
    const effectiveHours = this.approvedForm.get('effectiveHours').value;

    // const updatedTimesheetData = { comment, status: 1 };
    const updatedTimesheetData = {
      comment,
      effectiveHours, // ✅ Sending effective hours
      status: 1
  };
    // Call the service to update the Timesheet status
    (await this.service.updateTimesheet(id, updatedTimesheetData)).subscribe(
      (res) => {
        // On success, show a success message and redirect after confirmation
        swalWithBootstrapButtons
          .fire('Timesheet Approved', 'Timesheet approved successfully.', 'success')
          .then(() => {
            this.router.navigate(['/attendance/timesheet-list']);
          });
      },
      (error) => {
        // On error, show an error message and redirect
        swalWithBootstrapButtons
          .fire(
            'Error',
            'Failed to approve timesheet. Please try again later.',
            'error'
          )
          .then(() => {
            this.router.navigate(['/attendance/timesheet-list']);
          });
      }
    );
  }
}
