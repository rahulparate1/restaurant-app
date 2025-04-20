import { Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import { LeaveManagementServiceService } from '../leave-management-service.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-leave-approve',
  templateUrl: './leave-approve.component.html',
  styleUrls: ['./leave-approve.component.css']
})

export class LeaveApproveComponent {

  approvedForm: UntypedFormGroup;
  id: any;
  leaveDetails: any;
  employeeId: any;
  numberOfDays: number;
  employeeData: any;
  lowBalanceMessage: any;
  user: any;
  companyId: any;
  employeeSpecificData: any;
  startDate: any;
  endDate: any;
  type: any;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: LeaveManagementServiceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService,
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    // this.employeeId = this.user?.id;
    this.companyId = this.user?.companyId;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    // this.startDate = this.data.startDate;
    // this.endDate = this.data.endDate;
    // (this.type = this.data.type), (this.employeeId = this.data.employeeId);
    console.log("this.id==>", this.id)

    this.getLeaveDetails(this.id);
    this.approvedForm = this.formBuilder.group({
      comment: ['', Validators.required],
    });
  }


  async getLeaveDetails(id: any) {
    (await this.service.getLeavebyId(id)).subscribe((res: any) => {
      this.leaveDetails = res;
      this.calculateNumberOfDays();
    });
  }

  async updateStatus(id) {
    const comment = this.approvedForm.get('comment').value;
    const updatedLeaveData = { comment, status: 1 };

    // Call the service to update the leave status
    (await this.service.updateLeave(id, updatedLeaveData)).subscribe(
      (res) => {
        // On success, show a success message and redirect after confirmation
        swalWithBootstrapButtons
          .fire('Leave Approved', 'Leave approved successfully.', 'success')
          .then(() => {
            // Redirect to the leave management list page
            this.router.navigate(['/leave-management/leaves-list-admin']);
          });
      },
      (error) => {
        // On error, show an error message and redirect
        swalWithBootstrapButtons
          .fire(
            'Error',
            'Failed to approve leave. Please try again later.',
            'error'
          )
          .then(() => {
            // Redirect to the leave management list page
            this.router.navigate(['/leave-management/leaves-list-admin']);
          });
      }
    );
  }

  // calculateNumberOfDays() {
  //   if (this.leaveDetails.startDate && this.leaveDetails.endDate) {
  //     const startDate = new Date(this.leaveDetails.startDate);
  //     const endDate = new Date(this.leaveDetails.endDate);
  //     this.numberOfDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  //   }
  // }
  calculateNumberOfDays() {
    if (this.leaveDetails.startDate && this.leaveDetails.endDate) {
      const startDate = new Date(this.leaveDetails.startDate);
      const endDate = new Date(this.leaveDetails.endDate);

      // Calculate the difference in time (milliseconds)
      const timeDifference = endDate.getTime() - startDate.getTime();

      // If the startDate and endDate are the same, duration is 1 day
      if (timeDifference === 0) {
        this.numberOfDays = 1;
      } else {
        // Otherwise, calculate the duration as the difference in days, adding 1 to include both start and end days
        this.numberOfDays = Math.floor(timeDifference / (1000 * 3600 * 24)) + 1;
      }
    }
  }


  async postNotification() {
    const notificationObj = {
      title: 'Reject Leave',
      description: 'Leave has been rejected.',
    };

    (await this.service.postNotification(notificationObj)).subscribe(
      () => {
        this.apiService.stopLoader();
      }
    );
  }


  // async rejectLeave() {
  //   this.lowBalanceMessage = '';
  //   const startDate = new Date(this.startDate);
  //   const endDate = new Date(this.endDate);
  //   const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  //   if (this.employeeSpecificData && this.type.value) {
  //     const leaveLabel = this.type.value;
  //     const leaveDetails = this.employeeSpecificData.leaveDetails;

  //     if (leaveDetails && leaveDetails[leaveLabel]) {
  //       leaveDetails[leaveLabel] = parseInt(leaveDetails[leaveLabel], 10) + daysDifference;
  //       try {
  //         await (await this.service.updateEmployee(this.employeeId, { leaveDetails })).subscribe();

  //         this.postNotification();
  //         this.lowBalanceMessage = `Leave rejected successfully. You have ${leaveDetails[leaveLabel]} ${leaveLabel} remaining.`;
  //       } catch {
  //         this.lowBalanceMessage = 'Failed to update leave details. Please try again later.';
  //       }
  //     } else {
  //       this.lowBalanceMessage = 'Invalid leave type or leave balance data not available';
  //     }
  //   }
  // }
}
