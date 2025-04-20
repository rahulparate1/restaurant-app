import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../attendance.service';
import { ApiService } from 'src/app/services/api.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-reject-timesheet',
  templateUrl: './reject-timesheet.component.html',
  styleUrls: ['./reject-timesheet.component.css']
})
export class RejectTimesheetComponent implements OnInit {
  rejectForm: UntypedFormGroup;
  timesheetDetails: any;
  id: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private service: AttendanceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id"); // Retrieve 'id' from route params
    console.log("this.id==>", this.id);
    this.getTimesheetDetails(this.id);
    this.rejectForm = this.formBuilder.group({
      comment: ["", Validators.required],
    });
  }

  async getTimesheetDetails(id: any) {
    (await this.service.getTimesheetbyId(id)).subscribe((res: any) => {
      this.timesheetDetails = res;
      console.log("this.timesheetDetails==>", this.timesheetDetails)
    });
  }

  async updateStatus(id) {
    const comment = this.rejectForm.get("comment")?.value;
    const updatedTimesheetData = { comment, status: 2 }; // Status 2 for rejection

    (await this.service.updateTimesheet(this.id, updatedTimesheetData)).subscribe(
      () => {
        this.postNotification();
        Swal.fire(
          "Timesheet Rejected",
          "Timesheet rejected successfully.",
          "success"
        ).then(() => {
          // Navigate to the Timesheets list page after successful rejection
          this.router.navigate(["/attendance/timesheet-list"]);
        });
      },
      () => {
        Swal.fire(
          "Error",
          "Failed to reject Timesheet. Please try again later.",
          "error"
        ).then(() => {
          // Navigate to the Timesheets list page after error
          this.router.navigate(["/attendance/timesheet-list"]);
        });
      }
    );
  }
  async postNotification() {
    const notificationObj = {
      title: "Reject Timesheet",
      description: "Timesheet has been rejected.",
    };

    (await this.service.postNotification(notificationObj)).subscribe(() => {
      this.apiService.stopLoader();
    });
  }
}
