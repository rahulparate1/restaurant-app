import { Component } from "@angular/core";
import { EmployeeManagementService } from "../employee-management.service";
import { ChartType } from "./apex.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-employee-dashboard",
  templateUrl: "./employee-dashboard.component.html",
  styleUrls: ["./employee-dashboard.component.css"],
})
export class EmployeeDashboardComponent {
  breadCrumbItems: Array<{}>;
  departmentChart: ChartType;
  employeeTypeChart: ChartType;
  workLocationChart: ChartType;
  inMonthCount: ChartType;
  employeeDepartmentCount: any[];
  employeeTypeCount: any[];
  totalEmployee: number;
  exitListData: any;
  statusCount: any;
  filteredEmployeeList: any;
  offset: number = 0;
  limit: number = 10;

  constructor(
    private employeeService: EmployeeManagementService,
    public router: Router
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Employee" },
      { label: "Dashboard", active: true },
    ];
    this._fetchData();
    this.getStatusCountData();
    this.getEmployeeList();
  }

  private _fetchData() {
    this.getEmpDepartmentCount();
    this.getEmployeeTypeCount();
    this.getWorkLocationCount();
    this.getMonthCount();
    this.getExitList();
  }

  async getEmpDepartmentCount() {
    (await this.employeeService.getEmployeeDepartmentCount()).subscribe(
      (res: { counts: any[]; totalCount: number }) => {
        this.employeeDepartmentCount = res.counts;
        const department = res.counts.map((item) => item.department);
        const count = res.counts.map((item) => item.count);

        const shortDepartmentNames = department.map((dep) => {
          return dep
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
        });

        this.totalEmployee = res.totalCount;

        // Set the bar chart configuration dynamically
        this.departmentChart = {
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
            },
          },
          dataLabels: {
            enabled: false,
          },
          series: [
            {
              data: count,
            },
          ],
          colors: ["#34c38f"],
          xaxis: {
            categories: shortDepartmentNames,
          },
          grid: {
            borderColor: "#f1f1f1",
          },
          tooltip: {
            custom: function ({ seriesIndex, dataPointIndex, w }) {
              const fullDepartmentName = department[dataPointIndex];
              const countValue = w.globals.series[seriesIndex][dataPointIndex];
              return (
                `<div class="apexcharts-tooltip-title" style="color: #2A3547">${fullDepartmentName}</div>` +
                `<div class="apexcharts-tooltip-title" style="color: #2A3547;">Employees: ${countValue}</div>`
              );
            },
            theme: "dark",
          },
        };
      },
      (err) => {
        console.error("Error retrieving department data:", err);
      }
    );
  }

  async getEmployeeTypeCount() {
    (await this.employeeService.getEmployeeCount()).subscribe(
      (res: { counts: any[]; totalCount: number }) => {
        this.employeeTypeCount = res.counts;
        const employeeType = res.counts.map((item) => item.employeeType);
        const count = res.counts.map((item) => item.count);

        // Dynamically set up the employeeTypeChart configuration
        this.employeeTypeChart = {
          chart: {
            height: 320,
            type: "pie",
          },
          series: count,
          labels: employeeType,
          colors: ["#34c38f", "#556ee6", "#f46a6a", "#50a5f1", "#f1b44c"],
          legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            verticalAlign: "middle",
            floating: false,
            fontSize: "14px",
            offsetX: 0,
            offsetY: -10,
          },
          responsive: [
            {
              breakpoint: 600,
              options: {
                chart: {
                  height: 240,
                },
                legend: {
                  show: false,
                },
              },
            },
          ],
        };
      },
      (err) => {
        console.error("Error retrieving employee type data:", err);
      }
    );
  }

  async getWorkLocationCount() {
    (await this.employeeService.getWorkLocationCount()).subscribe(
      (res: { counts: any[]; totalCount: number }) => {
        this.employeeTypeCount = res.counts;
        const workLocation = res.counts.map((item) => item.workLocation); // Get employee types (labels)
        const count = res.counts.map((item) => item.count); // Get the counts (data for the chart)

        // Dynamically set up the employeeTypeChart configuration
        this.workLocationChart = {
          chart: {
            height: 320,
            type: "pie",
          },
          series: count,
          labels: workLocation,
          colors: ["#34c38f", "#556ee6", "#f46a6a", "#50a5f1", "#f1b44c"],
          legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            verticalAlign: "middle",
            floating: false,
            fontSize: "14px",
            offsetX: 0,
            offsetY: -10,
          },
          responsive: [
            {
              breakpoint: 600,
              options: {
                chart: {
                  height: 240,
                },
                legend: {
                  show: false,
                },
              },
            },
          ],
        };
      },
      (err) => {
        console.error("Error retrieving employee type data:", err);
      }
    );
  }

  async getMonthCount() {
    (await this.employeeService.getMonthYearCount()).subscribe(
      (res: { counts: any[]; totalCount: number }) => {
        const monthNames = [
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
        const monthIndexCountMap: { [key: number]: number } = {};

        res.counts.forEach((item) => {
          const date = new Date(item.monthYear);
          const monthIndex = date.getMonth();
          monthIndexCountMap[monthIndex] = item.count;
        });
        const monthYearLabels = monthNames.map((month, index) => {
          const year = new Date(res.counts[0]?.monthYear)
            .getFullYear()
            .toString()
            .slice(-2);
          return `${month} ${year}`;
        });
        const counts = monthNames.map(
          (month, index) => monthIndexCountMap[index] || 0
        );

        // Dynamically set up the line chart configuration
        this.inMonthCount = {
          chart: {
            height: 380,
            type: "line",
            zoom: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
          },
          colors: ["#556ee6"],
          dataLabels: {
            enabled: true,
          },
          stroke: {
            width: [3],
            curve: "smooth",
          },
          series: [
            {
              name: "Employees Joined",
              data: counts,
            },
          ],
          title: {
            text: "Employees Joined by Month/Year",
            align: "left",
          },
          grid: {
            row: {
              colors: ["transparent", "transparent"],
              opacity: 0.2,
            },
            borderColor: "#f1f1f1",
          },
          markers: {
            style: "inverted",
            size: 6,
          },
          xaxis: {
            categories: monthYearLabels,
            title: {
              text: "Month/Year",
            },
          },
          yaxis: {
            title: {
              text: "Employee Count",
            },
            min: 0,
          },
          legend: {
            position: "top",
            horizontalAlign: "right",
            floating: true,
            offsetY: -25,
            offsetX: -5,
          },
          responsive: [
            {
              breakpoint: 600,
              options: {
                chart: {
                  toolbar: {
                    show: false,
                  },
                },
                legend: {
                  show: false,
                },
              },
            },
          ],
        };
      },
      (err) => {
        console.error("Error retrieving month-year data:", err);
      }
    );
  }

  async getExitList() {
    (await this.employeeService.getExitListCount()).subscribe(
      (res) => {
        this.exitListData = res?.exitOrNoticeEmployees;
      },
      (error) => {
        console.error("Error retrieving exit list data:", error);
      }
    );
  }

  // Fetch status count
  async getStatusCountData() {
    (await this.employeeService.getStatusCount()).subscribe(
      (res) => {
        this.statusCount = res;
      },
      (error) => {
        console.error("Error fetching status count data", error);
      }
    );
  }

  // Fetch the employee list
  async getEmployeeList() {
    let search: any = {};
    this.limit = 6;
    (
      await this.employeeService.getEmployeeFilter(
        this.offset,
        this.limit,
        search
      )
    ).subscribe(
      (res) => {
        this.filteredEmployeeList = res?.data || [];
      },
      (error) => {
        console.error("Error fetching employee data", error);
      }
    );
  }

  goToAllEmployees() {
    this.router.navigate(["employee/list"]);
  }
}
