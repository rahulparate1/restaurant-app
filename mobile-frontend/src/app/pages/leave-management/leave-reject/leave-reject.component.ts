import { Component, OnInit } from "@angular/core";
import { FormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { ApiService } from "src/app/services/api.service";
import { LeaveManagementServiceService } from "../leave-management-service.service";

@Component({
  selector: "app-leave-reject",
  templateUrl: "./leave-reject.component.html",
  styleUrls: ["./leave-reject.component.css"],
})
export class LeaveRejectComponent implements OnInit {
  rejectForm: UntypedFormGroup;
  leaveDetails: any;
  id: any;
  numberOfDays: number;
  lowBalanceMessage: string = "";
  startDate: any;
  endDate: any;
  employeeSpecificData: any;
  type: any;
  employeeId: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private service: LeaveManagementServiceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id"); // Retrieve 'id' from route params
    console.log("this.id==>", this.id);
    this.getLeaveDetails(this.id);
    this.rejectForm = this.formBuilder.group({
      comment: ["", Validators.required],
    });
  }

  // async updateStatus(id) {
  //   const comment = this.rejectForm.get('comment')?.value;
  //   const updatedLeaveData = { comment, status: 2 };

  //   (await this.service.updateLeave(this.id, updatedLeaveData)).subscribe(
  //     () => {
  //       this.postNotification();
  //       Swal.fire('Leave Rejected', 'Leave rejected successfully.', 'success').then(() => {
  //         // Navigate to the leaves list page after successful rejection
  //         this.router.navigate(['/leave-management/leaves-list-admin']);
  //       });
  //     },
  //     () => {
  //       Swal.fire('Error', 'Failed to reject leave. Please try again later.', 'error').then(() => {
  //         // Navigate to the leaves list page after error
  //         this.router.navigate(['/leave-management/leaves-list-admin']);
  //       });
  //     }
  //   );
  // }

  async updateStatus(id) {
    const comment = this.rejectForm.get("comment")?.value;
    const updatedLeaveData = { comment, status: 2 }; // Status 2 for rejection

    (await this.service.updateLeave(this.id, updatedLeaveData)).subscribe(
      () => {
        this.postNotification();
        Swal.fire(
          "Leave Rejected",
          "Leave rejected successfully.",
          "success"
        ).then(() => {
          // Navigate to the leaves list page after successful rejection
          this.router.navigate(["/leave-management/leaves-list-admin"]);
        });
      },
      () => {
        Swal.fire(
          "Error",
          "Failed to reject leave. Please try again later.",
          "error"
        ).then(() => {
          // Navigate to the leaves list page after error
          this.router.navigate(["/leave-management/leaves-list-admin"]);
        });
      }
    );
  }

  async getLeaveDetails(id: any) {
    (await this.service.getLeavebyId(id)).subscribe((res: any) => {
      this.leaveDetails = res;
    });
  }

  async postNotification() {
    const notificationObj = {
      title: "Reject Leave",
      description: "Leave has been rejected.",
    };

    (await this.service.postNotification(notificationObj)).subscribe(() => {
      this.apiService.stopLoader();
    });
  }
}
