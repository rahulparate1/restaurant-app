import { Component } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { LeaveStatus, rolesType } from 'src/app/layouts/shared/constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});
@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent {

  designation: string = "";
  user: any;
  id: any;

  breadCrumbItems: Array<{}>;
  designationRole: { key: string; value: string }[];
  timesheetData: any;
  empList: any;
  approvedForm: FormGroup;
  rejectForm: FormGroup

   //filter and search
   searchByDescription = "";
   filterByStatus = "";
   filterByAmount = "";
   filterByName = "";
   filterByType = "";
   years: number[] = [];
   months: { month: string; name: string; disabled: boolean }[] = [];
   selectedYear: number | null = null;
   // selectedMonthYear: string | null = null;
   selectedMonthYear: string = "";
   today: Date = new Date();
   selectedDate: string = ""; // Holds the selected date in 'YYYY-MM-DD' format
   minMonthYear: string = "2010-01";
   minDate: string = "";

    //For pagination
  pageNumber: number = 1;
  totalRecord: number = 0;
  offset: number = 0;
  limit: number = 10; // Example: 10 records per page
  currentPage: number = 1;
  loadingTrans: boolean;
  data1: any;
  dataSource: any;
  totalCount = -1;
  Closed = -1;
  Inprogress = -1;
  Open = -1;

  timesheetDetails: any;
  TimesheetStatus: any = LeaveStatus;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  constructor(
    private service: AttendanceService,
    public router: Router,
    private apiService: ApiService,
    private modalService: NgbModal,
    private fb: FormBuilder,  // Inject FormBuilder
    private activeRoute: ActivatedRoute,


  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Timesheets" },
      { label: "Timesheet-List", active: true },
    ];
    this.designationRole = rolesType;
    const today = new Date();
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const currentDay = String(today.getDate()).padStart(2, "0");
    this.selectedDate = `${currentYear}-${currentMonth}-${currentDay}`;

  // Allow selecting the previous 10 years
  const minYear = currentYear - 10;
  this.minDate = `${minYear}-01-01`;  // Setting January 1st of the min year as the minimum allowed
    this.getEmployee();
    this.getAllTimesheets();
  }

   // Initialize form with validation
   initializeRejectForm() {
    this.rejectForm = this.fb.group({
      comment: ["", Validators.required],
    });
  }

  initializeApproveForm() {
    this.approvedForm = this.fb.group({
      effectiveHours: ['', [Validators.required]],
      comment: ['']
    });
  }

  getStatusLabel(statusId: any): string {
    const status = this.TimesheetStatus?.find(
      (TimesheetStatus) => TimesheetStatus?.id === Number(statusId)
    );
    console.log("status==>", status)
    return status ? status.label : "Unknown";
  }

  async getEmployee() {
    (await this.service.getEmployeeListForFilter()).subscribe(
      (res) => {
        if (res) {
          // Assuming the response is now an array of { id: string, name: string }
          this.empList = res.map((employee) => ({
            id: employee?.id || "", // Provide a fallback to ensure id is always a string
            name: employee?.name,
          }));

          console.log("this.empList==>", this.empList)
        }
      },
      (error) => {
        console.error("Error fetching employees:", error); // Handle errors here
      }
    );
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.empList?.find((emp) => emp?.id === employeeId);
    return employee ? employee.name : "Employee Not Found";
  }

async getAllTimesheets() {
  this.apiService.startLoader();
  let search: any = {};

  if (this.searchByDescription != "") {
    const pattern = {
      like: "_*" + this.searchByDescription + ".*",
      options: "i",
    };
    search.taskDescription = pattern;
  }

  if (this.filterByName != "") {
    search.userId = this.filterByName;
  }

  if (this.filterByStatus != "") {
    search.status = this.filterByStatus;
  }

  if (this.selectedDate) {
    const [year, month, day] = this.selectedDate.split("-");
    search.day = day;
    search.month = month;
    search.year = year;
  }

  (await this.service.getAllTimesheets(this.offset, this.limit, search)).subscribe(
    (res: any) => {
      this.timesheetData = res?.data?.map((item) => ({
        ...item,
        status: item?.status,
      })) || [];
      this.totalRecord = res?.totalRecord;
      this.getPageNumbers();
      this.apiService.stopLoader();
    }
  );
}

// Update method to handle full date selection
onDateChange(event: Event) {
  const target = event.target as HTMLInputElement;
  this.selectedDate = target.value; // 'YYYY-MM-DD' format
  this.offset = 0; // Reset offset for new search
  this.getAllTimesheets();
}
  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1; // Recalculate current page based on new limit
    this.offset = (this.currentPage - 1) * this.limit; // Recalculate offset based on new limit and current page
    this.getAllTimesheets();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getAllTimesheets();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRecord / this.limit);
    const currentPage = Math.ceil((this.offset + 1) / this.limit); // Current page calculation
    const maxPagesToShow = 10; // Maximum number of pages to show in pagination

    let startPage: number, endPage: number;
    if (totalPages <= maxPagesToShow) {
      // Less than or equal to maxPagesToShow pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // More than maxPagesToShow pages so calculate start and end pages
      const halfPagesToShow = Math.floor(maxPagesToShow / 2);
      if (currentPage <= halfPagesToShow) {
        // Current page is near the start
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + halfPagesToShow >= totalPages) {
        // Current page is near the end
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        // Current page is somewhere in the middle
        startPage = currentPage - halfPagesToShow;
        endPage = currentPage + halfPagesToShow;
      }
    }

    // Generate an array of page numbers to iterate over in the template
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  goToPage(pageNumber: number): void {
    this.offset = (pageNumber - 1) * this.limit;
    this.currentPage = pageNumber;
    this.getAllTimesheets();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecord) {
      this.offset += this.limit;
      this.currentPage++;
      this.getAllTimesheets();
    }
  }

  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 10;
    this.currentPage = 1;
  }

  reset() {
    this.searchByDescription = "";
    this.filterByName = "";
    this.filterByStatus = "";
    const newDate = new Date().toISOString().split('T')[0];
    this.selectedDate = ""; // Temporarily reset
    this.selectedDate = newDate;
    this.resetToPageOne();
    this.getAllTimesheets();
  }

  resetFilter(filter: string): void {
    switch (filter) {
      case "taskDescription":
        this.searchByDescription = "";
        break;
      case "name":
        this.filterByName = "";
        break;
      case "status":
        this.filterByStatus = "";
        break;
        case "monthYear":
          const newDate = new Date().toISOString().split('T')[0];
          this.selectedDate = ""; // Temporarily reset
          this.selectedDate = newDate;
          break;
    }
    this.resetToPageOne(); // Optionally reset pagination when filter is cleared
    this.getAllTimesheets(); // Refresh the data after resetting the filter
  }

  timesheetDetailsModal(timesheetDetailsModal: any, item: any) {
    this.modalService.open(timesheetDetailsModal, { centered: true });
    this.timesheetDetails = item;
  }

  // Method for routing to the LeaveRejectComponent
  openApprovalModal(approvalModal: any, item: any) {
    this.modalService.open(approvalModal, { centered: true });
    this.timesheetData = item;
    this.initializeApproveForm();
    this.approvedForm.reset(); // Reset form fields before assigning new values

  }

  // Another method for rejecting leave (you can define this similarly)
  openRejectModal(rejectModal: any, item: any) {
    this.modalService.open(rejectModal, { centered: true });
    this.timesheetData = item;
    this.initializeRejectForm();
    this.rejectForm.reset(); // Reset form fields before assigning new values
  }

  async updateStatusToApprove(id) {
    if (!this.approvedForm) {
      this.initializeApproveForm(); // Initialize form only when modal opens
    }

    const comment = this.approvedForm.get('comment').value;
    const effectiveHours = this.approvedForm.get('effectiveHours').value;

    const updatedTimesheetData = {
      comment,
      effectiveHours,
      status: 1
    };

    try {
      (await this.service.updateTimesheet(id, updatedTimesheetData)).subscribe(
        () => {
          this.postApproveNotification();
          swalWithBootstrapButtons
            .fire('Timesheet Approved', 'Timesheet approved successfully.', 'success')
            .then(() => {
              this.approvedForm.reset(); // ✅ Reset form
              this.modalService.dismissAll(); // ✅ Close modal
              this.router.navigate(['/attendance/timesheet-list']);
              this.getAllTimesheets();
              // this.router.navigate(['/attendance/timesheet-list']);
            });
        },
        () => {
          swalWithBootstrapButtons
            .fire('Error', 'Failed to approve timesheet. Please try again later.', 'error')
            .then(() => {

              this.router.navigate(['/attendance/timesheet-list']);
            });
        }
      );
    } catch (error) {
      swalWithBootstrapButtons
        .fire('Error', 'Something went wrong. Please try again.', 'error')
        .then(() => {
          this.router.navigate(['/attendance/timesheet-list']);
        });
    }
  }

  async updateStatusToReject(id) {
    if (!this.rejectForm) {
      this.initializeRejectForm(); // Initialize form only when modal opens
    }

    const comment = this.rejectForm.get('comment').value;
    const updatedTimesheetData = {
      comment,
      status: 2
    };

    try {
      (await this.service.updateTimesheet(id, updatedTimesheetData)).subscribe(
        () => {
          this.postRejectNotification();
          swalWithBootstrapButtons
            .fire('Timesheet Rejected', 'Timesheet rejected successfully.', 'success')
            .then(() => {
              this.rejectForm.reset(); // ✅ Reset form
            this.modalService.dismissAll(); // ✅ Close modal
            this.router.navigate(['/attendance/timesheet-list']);
            this.getAllTimesheets();

              // this.router.navigate(['/attendance/timesheet-list']);
            });
        },
        () => {
          swalWithBootstrapButtons
            .fire('Error', 'Failed to Reject timesheet. Please try again later.', 'error')
            .then(() => {
              this.router.navigate(['/attendance/timesheet-list']);
            });
        }
      );
    } catch (error) {
      swalWithBootstrapButtons
        .fire('Error', 'Something went wrong. Please try again.', 'error')
        .then(() => {
          this.router.navigate(['/attendance/timesheet-list']);
        });
    }
  }

  async postRejectNotification() {
    const notificationObj = {
      title: "Reject Timesheet",
      description: "Timesheet has been rejected.",
    };

    (await this.service.postNotification(notificationObj)).subscribe(() => {
      this.apiService.stopLoader();
    });
  }

  async postApproveNotification() {
    const notificationObj = {
      title: "Approved Timesheet",
      description: "Timesheet has been Approved.",
    };
    (await this.service.postNotification(notificationObj)).subscribe(() => {
      this.apiService.stopLoader();
    });
  }

  navigateToList(){
    this.router.navigate(['/attendance/timesheet-list'])
  }
}
