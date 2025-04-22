import { Component, HostListener, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NotificationsService } from "../notifications.service";
import { ApiService } from "src/app/services/api.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-notification-list",
  templateUrl: "./notification-list.component.html",
  styleUrls: ["./notification-list.component.css"],
})
export class NotificationListComponent implements OnInit {
  user: any;
  designation: any;
  isSecretary: boolean;

  currentNotifications: any[];

  page = 1;
  isLoading: boolean = false;
  itemsPerPage = 10;
  hasMoreRequests: boolean = true;
  notificationGetList: any[];
  notificationData: any[];
  @ViewChild('timesheetDetailsModal') timesheetDetailsModal!: TemplateRef<any>;
  timesheetDetails: any;

  constructor(
    public router: Router,
    private service: NotificationsService,
    private apiService: ApiService,
    private modalService: NgbModal
  ) {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.designation = this.user?.designation;
  }

  ngOnInit(): void {
    this.getNotificationList();
    this.user = JSON.parse(localStorage.getItem("user"));
    if (this.user?.designation == "secretary") {
      this.isSecretary = true;
    }
  }

  // async getNotificationList() {
  //   if (!this.hasMoreRequests || this.isLoading) {
  //     return;
  //   }
  //   if (this.page === 1) {
  //     this.apiService.startLoader();
  //   } else {
  //     this.isLoading = true;
  //   }
  //   const offset = (this.page - 1) * this.itemsPerPage;
  //   const limit = this.itemsPerPage;

  //   try {
  //     (await this.service.getNotification1(offset, limit)).subscribe(
  //       (res) => {
  //         console.log("res==>", res)
  //         if (!res || res.length === 0) {
  //           this.hasMoreRequests = false;
  //         }
  //         if (!this.currentNotifications) {
  //           this.currentNotifications = [];
  //         }
  //         this.currentNotifications.push(...res);
  //         this.isLoading = false;
  //         this.markNotificationRead();
  //       },
  //       (error) => {
  //         this.isLoading = false;
  //         // Handle error
  //       },
  //       () => {
  //         this.apiService.stopLoader();
  //       }
  //     );
  //   } catch (error) {
  //     // Handle error
  //   }
  // }
  async getNotificationList() {
    if (!this?.hasMoreRequests || this?.isLoading) {
      return;
    }

    if (this.page === 1) {
      this.apiService.startLoader();
    } else {
      this.isLoading = true;
    }

    const offset = (this.page - 1) * this.itemsPerPage;
    const limit = this.itemsPerPage;

    try {
      (await this.service.getNotification1(offset, limit)).subscribe(
        (res) => {
          console.log("res==>", res);
          if (!res || res?.length === 0) {
            this.hasMoreRequests = false;
          }

          if (!this.currentNotifications) {
            this.currentNotifications = [];
          }

          // 👉 Add path to each notification object
          const enrichedNotifications = res.map((n) => ({
            ...n,
            path: this.getNotificationRoute(n)
          }));

          this.currentNotifications?.push(...enrichedNotifications);
          this.isLoading = false;
          this.markNotificationRead();
        },
        (error) => {
          this.isLoading = false;
          // Handle error
        },
        () => {
          this.apiService.stopLoader();
        }
      );
    } catch (error) {
      // Handle error
    }
  }

  @HostListener("window:scroll", ["$event"])
  onScroll() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const bodyHeight = document.body.scrollHeight;
    const scrollThreshold = bodyHeight * 0.9;
    if (scrollPosition >= scrollThreshold && !this.isLoading) {
      this.page++;
      this.getNotificationList();
    }
  }

  async markNotificationRead() {
    (await this.service.markAsRead()).subscribe(
      (res) => {},
      (err) => {}
    );
  }

  async deleteNotification(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        icon: "warning",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.service.deleteNotification(id)).subscribe((res) => {
            window.location.reload();
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // this.apiService.loaderStop(2);
        }
      });
  }
  getNotificationRoute(notification: any): string {
    const data = notification?.data || {};

    switch (notification?.module) {
      case 'notice':
        return `/notice/notice-details/${data?.noticeId || data?.id}`;
        case 'events':
        return `/event/event-details/${data?.eventsId || data?.id}`;
        // case 'notice':
        // return `/notice/notice-details/${data?.noticeId || data?.id}`;
      case 'reimbursement':
        return `/reimbursement/details/${data?.reimbursementId || data?.id}`;
      case 'newsfeed':
        return `/newsfeed/details/${data?.newsfeedId || data?.id}`;
      case 'polls':
        return `/polls/poll-details/${data?.pollId || data?.id}`;
        case 'timesheet':
          return ''; // not needed since handled via modal
      // case 'timesheet':
      //   return `/timesheet/details/${data?.timesheetId || data?.id}`;
      case 'leave':
        return `/leave-management/leave-details/${data?.leaveId || data?.id}`;
      default:
        return '/notifications'; // fallbackc
    }
  }

  // async openModalForTimesheet(timesheetId: string): Promise<void> {
  //   (await this.attendanceService.getTimesheetbyId(timesheetId)).subscribe({
  //     next: (res) => {
  //       this.timesheetDetails = res;
  //       this.modalService.open(this.timesheetDetailsModal, { centered: true });
  //     },
  //     error: (err) => {
  //       console.error('Error fetching timesheet details:', err);
  //     }
  //   });
  // }

  // async openModalForTimesheet(timesheetId: string) {
  //   if (!timesheetId) return;

  //   (await this.attendanceService.getTimesheetbyId(timesheetId)).subscribe({
  //     next: (res) => {
  //       this.timesheetDetails = res;
  //       this.modalService.open(this.timesheetDetailsModal, { centered: true });
  //     },
  //     error: (err) => {
  //       console.error('Error fetching timesheet details:', err);
  //     }
  //   });
  // }
}
