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
import { ChartType } from "./hr-dashboard-chartist.model";

@Component({
  selector: "app-hr-dashboard-leave",
  templateUrl: "./hr-dashboard-leave.component.html",
  styleUrls: ["./hr-dashboard-leave.component.css"],
})
export class HRDashboardLeaveComponent {
  basicColumChart: ChartType;
  defaultYear: number; // Define defaultYear property
  employeesOnLeaveToday: any[] = []; // List of employees on leave today
  leaveTypeChart: ChartType;
  selectedYearOverview: number;
  selectedYearLeaveType: number;
  minYear: number = 2010;
  currentYear: number = new Date().getFullYear();

  designation: string = "";
  user: any;
  id: any;
  // LeaveData: any = leaveData;
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
  limit: number; // Example: 10 records per page
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
  // selectedMonthYear: string | null = null;
  selectedMonthYear: string = "";
  selectedYear: string = "";
  selectedMonthYearChanged: boolean;

  today: Date = new Date();
  selectedDate: string = ""; // Holds the selected date in 'YYYY-MM-DD' format
  minMonthYear: string = "2010-01";
  // minYear: string = "2010";
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

  breadCrumbItems: Array<{}>;

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
      { label: "HR Leaves Dashboard", active: true },
    ];
    this.designationRole = rolesType;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;
    this.selectedYear = String(currentYear); // Fixed by converting currentYear to string
    // Allow selecting the previous 10 years
    const minYear = currentYear - 10;
    this.minMonthYear = `${minYear}-01`; // Setting January of the min year as the minimum allowed
    // Populate year options (last 10 years)
    this.getLeaveList();
    this.getLeaveType();
    this.getChartData();
    this.getLeaveTypeChartData();
    // Set default year to the current year
    this.selectedYearOverview = this.currentYear;
    this.selectedYearLeaveType = this.currentYear;
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

  async getLeaveList() {
    this.apiService.startLoader();
    let search: any = {};
    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-");
      search.month = month;
      search.year = year;
    }
    (await this.service.getLeave(this.offset, this.limit, search)).subscribe(
      (res: any) => {
        // Map the leave list
        this.leavelist =
          res?.data?.map((item) => ({
            ...item,
            typeLabel: this.getTypeLabel(item?.type), // Map type label
            statusLabel: this.getStatusLabel(item?.status), // Map status label
          })) || [];
        this.totalRecord = res?.totalRecord;
        // Calculate leave counts
        this.calculateLeaveCounts();
        if (!this.selectedMonthYearChanged) {
          this.filterEmployeesOnLeaveToday();
        }
        this.apiService.stopLoader();
      }
    );
  }

  async getChartData() {
    this.apiService.startLoader();
    let search: any = {};
    if (this.selectedYearOverview) {
      const year = this.selectedYearOverview.toString().split("-")[0];
      search.year = year;
    }
    (await this.service.getLeave(this.offset, this.limit, search)).subscribe(
      (res: any) => {
        // Map the leave list
        this.leavelist =
          res?.data?.map((item) => ({
            ...item,
            typeLabel: this.getTypeLabel(item?.type), // Map type label
            statusLabel: this.getStatusLabel(item?.status), // Map status label
            // statusClass: this.getStatusClass(item?.status), // Map status class
          })) || [];
        this.totalRecord = res?.totalRecord;
        // Calculate leave counts

        this.updateChartData();
        this.apiService.stopLoader();
      }
    );
  }

  onMonthYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonthYear = target.value; // 'YYYY-MM' format
    this.offset = 0; // Reset offset for new search
    this.selectedMonthYearChanged = true; // Set a flag indicating the month/year change
    this.getLeaveList();
  }

  reset() {
    this.selectedMonthYear = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    this.getLeaveList();
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

  getTypeLabel(typeId: string): string {
    const type = this.leaveTypeData?.find(
      (leaveType) => leaveType?.id === typeId
    );
    return type ? type.name : "Unknown";
  }

  // Helper methods for status mapping
  getStatusLabel(status: number): string {
    return LeaveStatus.find((s) => s.id === status)?.label || "Unknown";
  }

  updateChartData() {
    // Define months for the X-axis
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize arrays to hold counts for each leave status
    const pendingLeavesByMonth = Array(12).fill(0);
    const approvedLeavesByMonth = Array(12).fill(0);
    const rejectedLeavesByMonth = Array(12).fill(0);
    const totalLeavesByMonth = Array(12).fill(0);
    // Populate counts based on leave data
    this.leavelist.forEach((leave) => {
      const monthIndex = parseInt(leave.month) - 1; // Convert 'month' to 0-based index
      if (monthIndex >= 0 && monthIndex < 12) {
        // Validate month index
        totalLeavesByMonth[monthIndex]++;
        if (leave.status === 3) {
          pendingLeavesByMonth[monthIndex]++;
        } else if (leave.status === 1) {
          approvedLeavesByMonth[monthIndex]++;
        } else if (leave.status === 2) {
          rejectedLeavesByMonth[monthIndex]++;
        }
      }
    });

    // Calculate percentage values for each status by month
    const calculatePercentage = (statusArray: number[]) =>
      statusArray.map((count, index) =>
        totalLeavesByMonth[index] > 0
          ? (count / totalLeavesByMonth[index]) * 100
          : 0
      );

    const pendingPercentageByMonth = calculatePercentage(pendingLeavesByMonth);
    const approvedPercentageByMonth = calculatePercentage(
      approvedLeavesByMonth
    );
    const rejectedPercentageByMonth = calculatePercentage(
      rejectedLeavesByMonth
    );

    // Update chart configuration
    this.basicColumChart = {
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: "rounded",
          columnWidth: "80%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      colors: ["#34c38f", "#556ee6", "#f46a6a", "#e83e8c"], // Define colors for Pending, Approved, Rejected
      series: [
        { name: "Pending", data: pendingPercentageByMonth },
        { name: "Approved", data: approvedPercentageByMonth },
        { name: "Rejected", data: rejectedPercentageByMonth },
        { name: "Total Leaves", data: totalLeavesByMonth }, // Add total leaves series
      ],
      xaxis: {
        categories: months,
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `${Math.round(value)}%`, // Format as percentage
        },
        max: 100, // Set max value for percentage
        title: {
          text: "Percentage (%)",
        },
      },
      fill: {
        opacity: 1,
      },
      grid: {
        borderColor: "#f1f1f1",
      },

      // display the percentage for Total Leaves
      // tooltip: {
      //   y: {
      //     formatter: (val: number) => `${Math.round(val)}%`, // Format tooltip values as percentage
      //   }
      // }

      // display the actual count for Total Leaves
      tooltip: {
        y: {
          formatter: (val: number, { seriesIndex }: any) => {
            return seriesIndex === 3 ? `${val}` : `${Math.round(val)}%`; // For 'Total Leaves', show the count
          },
        },
      },
    };
  }

  // Handle year change for Leaves Overview
  onYearChangeForOverview(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedYearOverview = parseInt(target.value, 10);
    this.getChartData();
  }
  resetChartData() {
    this.selectedYearOverview = parseInt(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
        2,
        "0"
      )}`
    );
    this.getChartData();
  }
  resetLeaveTypeChartData() {
    this.selectedYearLeaveType = parseInt(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
        2,
        "0"
      )}`
    );
    this.getLeaveTypeChartData();
  }
  // Handle year change for Leave Type Overview
  onYearChangeForLeaveType(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedYearLeaveType = parseInt(target.value, 10);
    this.getLeaveTypeChartData();
  }

  filterEmployeesOnLeaveToday() {
    const today = new Date().toISOString().split("T")[0]; // Convert today's date to 'YYYY-MM-DD' format
    this.employeesOnLeaveToday = this.leavelist.filter((leave) => {
      const startDate = new Date(leave.startDate).toISOString().split("T")[0]; // Format start date as 'YYYY-MM-DD'
      const endDate = new Date(leave.endDate).toISOString().split("T")[0]; // Format end date as 'YYYY-MM-DD'
      return today >= startDate && today <= endDate; // Compare strings
    });
  }
  async getLeaveTypeChartData() {
    this.apiService.startLoader();
    let search: any = {};
    if (this.selectedYearLeaveType) {
      const year = this.selectedYearLeaveType.toString().split("-")[0];
      search.year = year;
    }

    (await this.service.getLeave(this.offset, this.limit, search)).subscribe(
      (res: any) => {
        // Map the leave list
        this.leavelist =
          res?.data?.map((item) => ({
            ...item,
            typeLabel: this.getTypeLabel(item?.type), // Map type label
            statusLabel: this.getStatusLabel(item?.status), // Map status label
            // statusClass: this.getStatusClass(item?.status), // Map status class
          })) || [];

        this.totalRecord = res?.totalRecord;
        // Calculate leave counts

        this.updateLeaveTypeChart();
        this.apiService.stopLoader();
      }
    );
  }

  updateLeaveTypeChart() {
    // Define months for the X-axis
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get leave type names
    const leaveTypes = this.leaveTypeData.map((type) => type.name);

    // Initialize arrays to hold leave type counts for each month
    const leaveTypeCountsByMonth = leaveTypes.map(() => Array(12).fill(0));
    const totalLeavesByMonth = Array(12).fill(0);

    // Populate counts based on leave data
    this.leavelist.forEach((leave) => {
      const monthIndex = parseInt(leave.month) - 1; // Convert 'month' to 0-based index
      const leaveTypeIndex = leaveTypes.findIndex(
        (type) => type === this.getTypeLabel(leave.type)
      );
      if (monthIndex >= 0 && monthIndex < 12 && leaveTypeIndex >= 0) {
        // Validate indices
        leaveTypeCountsByMonth[leaveTypeIndex][monthIndex]++;
        totalLeavesByMonth[monthIndex]++;
      }
    });

    // Calculate percentage values for each leave type by month
    const calculatePercentage = (typeCounts: number[]) =>
      typeCounts.map((count, month) =>
        totalLeavesByMonth[month] > 0
          ? (count / totalLeavesByMonth[month]) * 100
          : 0
      );

    const leaveTypePercentagesByMonth =
      leaveTypeCountsByMonth.map(calculatePercentage);

    // Format data for the chart series
    const series = leaveTypePercentagesByMonth.map((percentages, index) => ({
      name: leaveTypes[index],
      data: percentages,
    }));

    // Define additional colors to accommodate all leave types
    const colors = [
      "#34c38f",
      "#556ee6",
      "#f46a6a",
      "#f8c56e",
      "#6f42c1", // Existing colors
      "#ff5733",
      "#33b5ff",
      "#a0e57a",
      "#e83e8c", // New colors
    ];
    // Update the chart configuration
    this.leaveTypeChart = {
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      series: series,
      xaxis: {
        categories: months,
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `${Math.round(value)}%`, // Format as percentage
        },
        max: 100, // Set max value for percentage
        title: {
          text: "Percentage (%)",
        },
      },
      fill: {
        opacity: 1,
      },
      grid: {
        borderColor: "#f1f1f1",
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${Math.round(val)}%`, // Format tooltip values as percentage
        },
      },
      legend: {
        position: "top",
      },
      colors: colors, // Define colors for leave types
    };
  }
}
