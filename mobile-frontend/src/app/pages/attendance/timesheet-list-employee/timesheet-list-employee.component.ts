import { Component } from '@angular/core';
import { LeaveStatus, rolesType } from 'src/app/layouts/shared/constant';
import Swal from "sweetalert2";
import { AttendanceService } from '../attendance.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-timesheet-list-employee',
  templateUrl: './timesheet-list-employee.component.html',
  styleUrls: ['./timesheet-list-employee.component.css']
})
export class TimesheetListEmployeeComponent {
  designation: string = "";
  user: any;
  id: any;

  breadCrumbItems: Array<{}>;
  TimesheetStatus: any = LeaveStatus;
  timesheetList: any;
  empLeaveDetails: any;
  searchTerm: string = "";
  filterBy: string = "";
  timesheetDetails: any;

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
  filterByName = "";
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

  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Timesheets" },
      { label: "My Timesheets", active: true },
    ];
    this.designationRole = rolesType;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;
    // Allow selecting the previous 10 years
    const minYear = currentYear - 10;
    this.minMonthYear = `${minYear}-01`; // Setting January of the min year as the minimum allowed
    this.getTimesheetList();
    this.generateYears();
  }

  // Method to generate the list of years for selection (for example, last 10 years and the current year)
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear; i++) {
      this.years.push(i);
    }
  }

  async getTimesheetList() {
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

    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-"); // Note: month is already zero-padded in 'YYYY-MM' format
      search.month = month;
      search.year = year;
    }
    (await this.service.myTimesheet(this.offset, this.limit, search)).subscribe(
      (res: any) => {
        this.timesheetList =
          res?.data?.map((item) => ({
            ...item,
            status: item?.status,
          })) || [];
        this.totalRecord = res?.totalRecord;
        this.getPageNumbers();
        this.apiService.stopLoader();
      }
    );
  }

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1; // Recalculate current page based on new limit
    this.offset = (this.currentPage - 1) * this.limit; // Recalculate offset based on new limit and current page
    this.getTimesheetList();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getTimesheetList();
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
    this.getTimesheetList();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecord) {
      this.offset += this.limit;
      this.currentPage++;
      this.getTimesheetList();
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
    this.selectedMonthYear = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    this.resetToPageOne();
    this.getTimesheetList();
  }

  resetFilter(filter: string): void {
    switch (filter) {
      case "description":
        this.searchByDescription = "";
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
    this.getTimesheetList(); // Refresh the data after resetting the filter
  }

  onMonthYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonthYear = target.value; // 'YYYY-MM' format
    this.offset = 0; // Reset offset for new search
    this.getTimesheetList();
  }

  getStatusLabel(statusId: any): string {
    // Convert statusId to number for comparison if needed
    const status = this.TimesheetStatus?.find(
      (TimesheetStatus) => TimesheetStatus?.id === Number(statusId)
    );
    return status ? status.label : "Unknown";
  }

   openTimesheetDetailsModal(timesheetDetailsModal: any, item: any) {
    this.modalService.open(timesheetDetailsModal, { centered: true });
    this.timesheetDetails = item;
    console.log("this.timesheetDetails==>", this.timesheetDetails)
  }

}
