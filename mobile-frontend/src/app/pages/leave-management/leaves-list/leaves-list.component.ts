import { Component } from "@angular/core";
import {
  designationType,
  LeaveStatus,
  rolesType,
} from "src/app/layouts/shared/constant";
import { LeaveManagementServiceService } from "../leave-management-service.service";
import { LeaveTypeService } from "../leavetype.service";
import { ApiService } from "src/app/services/api.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

//Bootstrap Swal Button styling
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-leaves-list",
  templateUrl: "./leaves-list.component.html",
  styleUrls: ["./leaves-list.component.css"],
})
export class LeavesListComponent {
  designation: string = "";
  user: any;
  id: any;

  breadCrumbItems: Array<{}>;

  LeaveStatus: any = LeaveStatus;
  designationType: any = designationType;
  leaveTypeData: any;
  leavelist: any;
  empLeaveDetails: any;
  data: any;
  searchTerm: string = "";
  filterBy: string = "";

  //For pagination
  pageNumber: number = 1;
  totalRecord: number = 0;
  offset: number = 0;
  limit: number = 10;
  currentPage: number = 1;
  loadingTrans: boolean;
  data1: any;
  dataSource: any;
  totalCount = -1;
  Closed = -1;
  Inprogress = -1;
  Open = -1;

  //filter and search
  searchByDescription = "";
  filterByStatus = "";
  filterByAmount = "";
  filterByName = "";
  filterByType = "";
  years: number[] = [];
  months: { month: string; name: string; disabled: boolean }[] = [];
  selectedYear: number | null = null;
  selectedMonthYear: string = "";
  today: Date = new Date();
  selectedDate: string = "";
  minMonthYear: string = "2010-01";

  designationRole: { key: string; value: string }[];
  showNoDataFoundMessage: boolean = false;
  totalPages: number = 0;

  // Define properties for leave counts
  totalLeaves: number = 0;
  approvedLeaves: number = 0;
  pendingLeaves: number = 0;
  rejectedLeaves: number = 0;
  // Define the top cards data structure
  topCardsData: any[] = [];

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  constructor(
    private service: LeaveManagementServiceService,
    private leaveTypeService: LeaveTypeService,
    public router: Router,
    private apiService: ApiService
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Leaves" },
      { label: "My Leaves", active: true },
    ];
    this.designationRole = rolesType;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;
    // Allow selecting the previous 10 years
    const minYear = currentYear - 10;
    this.minMonthYear = `${minYear}-01`; // Setting January of the min year as the minimum allowed
    this.getLeaveList();
    this.generateYears();
    this.getLeaveType();
  }

  // Method to generate the list of years for selection (for example, last 10 years and the current year)
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear; i++) {
      this.years.push(i);
    }
  }

  async getLeaveList() {
    this.apiService.startLoader();
    let search: any = {};
    if (this.searchByDescription != "") {
      const pattern = {
        like: "_*" + this.searchByDescription + ".*",
        options: "i",
      }; // Case-insensitive search pattern
      search.description = pattern;
    }
    if (this.filterByStatus != "") {
      search.status = this.filterByStatus;
    }

    if (this.filterByType != "") {
      search.type = this.filterByType;
    }
    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-"); // Note: month is already zero-padded in 'YYYY-MM' format
      search.month = month;
      search.year = year;
    }
    (await this.service.myLeave(this.offset, this.limit, search)).subscribe(
      (res: any) => {
        this.leavelist =
          res?.data?.map((item) => ({
            ...item,
            typeLabel: this.getTypeLabel(item?.type),
            status: item?.status,
          })) || [];
        this.totalRecord = res?.totalRecord;
        this.calculateLeaveCounts();
        this.getPageNumbers();
        this.apiService.stopLoader();
      }
    );
  }
  // calculateLeaveCounts() {
  //   // Reset leave counts
  //   this.totalLeaves = this.leavelist.length;
  //   this.pendingLeaves = 0;
  //   this.approvedLeaves = 0;
  //   this.rejectedLeaves = 0;

  //   // Calculate leave counts based on status
  //   this.leavelist.forEach((leave) => {
  //     switch (leave.status) {
  //       case 3:
  //         this.pendingLeaves++;
  //         break;
  //       case 1:
  //         this.approvedLeaves++;
  //         break;
  //       case 2:
  //         this.rejectedLeaves++;
  //         break;
  //       default:
  //         console.warn(`Unexpected leave status: ${leave.status}`);
  //         break;
  //     }
  //   });

  //   // Debugging warning for empty topCardsData
  //   if (this.topCardsData.length === 0) {
  //     console.warn(
  //       "Top Cards Data is empty. Check if mapLeaveDataForTopCards() is called."
  //     );
  //   }
  // }
  calculateLeaveCounts() {
    // Reset leave counts
    this.totalLeaves = 0;
    this.pendingLeaves = 0;
    this.approvedLeaves = 0;
    this.rejectedLeaves = 0;

    // Calculate leave counts based on duration and status
    this.leavelist.forEach((leave) => {
      const duration = leave.duration || 0; // Ensure duration is always a number
      this.totalLeaves += duration; // Add to total leaves

      switch (leave.status) {
        case 3: // Pending
          this.pendingLeaves += duration;
          break;
        case 1: // Approved
          this.approvedLeaves += duration;
          break;
        case 2: // Rejected
          this.rejectedLeaves += duration;
          break;
        default:
          console.warn(`Unexpected leave status: ${leave.status}`);
          break;
      }
    });

    // Debugging warning for empty topCardsData
    if (this.topCardsData.length === 0) {
      console.warn(
        "Top Cards Data is empty. Check if mapLeaveDataForTopCards() is called."
      );
    }
  }

  goToEdit(id) {
    this.router.navigate(["leave-management/apply-leave/" + id]);
  }

  async getLeaveType() {
    (await this.leaveTypeService.getLeaveType()).subscribe((res: any[]) => {
      this.leaveTypeData = res;
      this.leaveTypeData =
        res?.map((type) => ({
          id: type?.id,
          name: type?.name,
        })) || [];
    });
  }

  getTypeLabel(typeId: string): string {
    const type = this.leaveTypeData?.find(
      (leaveType) => leaveType?.id === typeId
    );
    return type ? type.name : "Unknown";
  }

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1; // Recalculate current page based on new limit
    this.offset = (this.currentPage - 1) * this.limit; // Recalculate offset based on new limit and current page
    this.getLeaveList();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getLeaveList();
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
    this.getLeaveList();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecord) {
      this.offset += this.limit;
      this.currentPage++;
      this.getLeaveList();
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
    this.filterByType = "";
    this.filterByName = "";
    this.filterByStatus = "";
    this.selectedMonthYear = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    this.resetToPageOne();
    this.getLeaveList();
  }

  applyLeave() {
    this.router.navigate(["leave-management/apply-leave"]);
  }

  // To delete the Activity by Id
  async deleteLeave(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        this.apiService.startLoader();
        // Calling Delete API
        if (result.value) {
          (await this.service.deleteLeave(id)).subscribe((res) => {
            this.apiService.stopLoader();
            this.getLeaveList();
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }

  // On Details/View button click
  goToDetails(id: any) {
    this.router.navigate(["leave-management/leave-details/" + id]);
  }

  onMonthYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonthYear = target.value; // 'YYYY-MM' format
    this.offset = 0; // Reset offset for new search
    this.getLeaveList();
  }

  getStatusLabel(statusId: any): string {
    // Convert statusId to number for comparison if needed
    const status = this.LeaveStatus?.find(
      (leaveStatus) => leaveStatus?.id === Number(statusId)
    );
    return status ? status.label : "Unknown";
  }

  resetFilter(filter: string): void {
    switch (filter) {
      case "description":
        this.searchByDescription = "";
        break;
      case "type":
        this.filterByType = "";
        break;
      case "status":
        this.filterByStatus = "";
        break;
      case "monthYear":
        this.selectedMonthYear = `${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}`;
        break;
    }
    this.resetToPageOne(); // Optionally reset pagination when filter is cleared
    this.getLeaveList(); // Refresh the data after resetting the filter
  }
}
