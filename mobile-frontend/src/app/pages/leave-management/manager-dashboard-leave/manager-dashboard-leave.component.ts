import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { LeaveManagementServiceService } from "../leave-management-service.service";
import { Router } from "@angular/router";
import { ApiService } from "src/app/services/api.service";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Usergrid } from "src/app/store/UserGrid/user.model";

@Component({
  selector: "app-manager-dashboard-leave",
  templateUrl: "./manager-dashboard-leave.component.html",
  styleUrls: ["./manager-dashboard-leave.component.css"],
})
export class ManagerDashboardLeaveComponent implements OnInit {
  designation: string = "";
  user: any;
  id: any;
  totalRecord: number = 0;
  offset: number = 0;
  limit: number; // Example: 10 records per page

  // bread crumb items
  breadCrumbItems: Array<{}>;
  empLeavesList: any[] = [];
  leaveTypeData: any;

  selectedMonthYear: string = ""; // Selected month and year in "YYYY-MM" format
  month: number = 0; // Selected month
  year: number = 0; // Selected year
  // To show slider/banner
  infoBannerCarousel: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: true,
    navText: [
      "<i class='mdi mdi-chevron-left'></i>",
      "<i class='mdi mdi-chevron-right'></i>",
    ],
    dots: false,
    responsive: {
      680: {
        items: 4,
      },
    },
  };
  constructor(
    private service: LeaveManagementServiceService,
    public router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Manager Leave Dashbord" },
      { label: "Employees Leaves Grid", active: true },
    ];
    this.getEmployeeListForManager();
    this.getLeaveType();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;

    this.getEmployeeListForManager();
  }

  /**
   * User grid data fetches
   */

  async getLeaveType() {
    (await this.service.getLeaveType()).subscribe((res: any[]) => {
      this.leaveTypeData = res;
      this.leaveTypeData =
        res?.map((type) => ({
          id: type?.id,
          name: type?.name,
        })) || [];
    });
  }
  // Get leave type label by ID
  getTypeLabel(typeId: string): string {
    const type = this.leaveTypeData?.find(
      (leaveType) => leaveType?.id === typeId
    );
    return type ? type.name : "Unknown";
  }

  // Helper method to format date to 'YYYY-MM'
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  }

  async getEmployeeListForManager() {
    this.apiService.startLoader();
    let search: any = {};

    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-");
      search.month = month;
      search.year = year;
    }

    try {
      (
        await this.service.getEmployeeListForManager(
          this.offset,
          this.limit,
          search
        )
      ).subscribe({
        next: (response) => {
          console.log("API Response:", response);
          this.empLeavesList =
            response?.data?.map((item) => ({
              ...item,
              typeLabel: this.getTypeLabel(item?.type),
            })) || [];
          this.totalRecord = response?.totalRecord;
          console.log("Updated Employee Leaves List:", this.empLeavesList);
          this.apiService.stopLoader();
        },
        error: (err) => {
          console.error("Error fetching leaves:", err);
        },
      });
    } catch (error) {
      console.error("Error in getEmployeeListForManager:", error);
    }
  }
  // Format ISO date to 'dd-MM-yyyy'
  // Utility function to format ISO dates
  formatISODate(date: string): string {
    if (!date) return "";
    const parsedDate = new Date(date);
    return `${parsedDate.getDate().toString().padStart(2, "0")}-${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${parsedDate.getFullYear()}`;
  }

  onMonthYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonthYear = target.value; // 'YYYY-MM' format
    this.offset = 0; // Reset offset for new search
    this.getEmployeeListForManager();
  }
}
