import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartType } from "./blog.model";
import { ChartComponent } from "ng-apexcharts";
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { AttendanceService } from '../attendance.service';
@Component({
  selector: 'app-admin-attendance-dashboard',
  templateUrl: './admin-attendance-dashboard.component.html',
  styleUrls: ['./admin-attendance-dashboard.component.css']
})
export class AdminAttendanceDashboardComponent {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  // visitor chart
  visitorsOptions: ChartType;
  popularPostData;
  public activeOptionButton = "all";
  // bread crumb items
  breadCrumbItems: Array<{}>;
  employeeData: any;
  totalEmployees: number = 0; // Declare totalEmployees variable
  RequestData?: any;
  year: string;
  month: string;
  attendancePercentage: number = 0;  // Declare the attendance percentage variable
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthlyAttendanceData: number[] = [];  // Holds the attendance percentage for each month
  attendanceChart: any = {};
  selectedYear: number; // Selected year
  availableYears: number[] = []; // List of available years
  constructor(
    private employeeService: EmployeeManagementService,
    private attendanceService: AttendanceService,
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Attendance' }, { label: 'Dashboards', active: true }];
    this.year = this.getCurrentYear().toString();
    this.month = this.getCurrentMonth().toString();
    const currentMonth = this.getCurrentMonth().toString().padStart(2, '0');
    this.month = `${this.year}-${currentMonth}`;
    this.getEmployee();
    this.getAttendanceList(this.year, this.month)
    this.initializeYears();
    this.selectedYear = new Date().getFullYear();
    this.getYearlyAttendance(this.selectedYear);
  }


  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  onYearChange(): void {
    this.getYearlyAttendance(this.selectedYear);
  }


  async getEmployee() {
    (await this.employeeService.getEmployeeList()).subscribe((res) => {
      this.employeeData = res?.data;
      this.totalEmployees = res?.totalRecord;
    });
  }


  async getAttendanceList(year, month) {
    (await this.attendanceService.getAttendanceAdmin(year, month)).subscribe({
      next: (res: any) => {
        this.RequestData = res?.data;
        if (this.RequestData && this.RequestData.length > 0) {
          const totalDays = this.RequestData.length;
          const presentDays = this.RequestData.filter(attendance => attendance.status === 'present').length;

          this.attendancePercentage = (presentDays / totalDays) * 100;
        }
      },
      error: (error) => {
        console.error('Error retrieving attendance data:', error);
      }
    });
  }

  getYearlyAttendance(year: number) {
    const monthlyPercentages = [];
    let completedMonths = 0;
    for (let month = 1; month <= 12; month++) {
      this.getAttendanceForMonth(year, month, (percentage: number) => {
        monthlyPercentages.push(percentage);
        completedMonths++;
        if (completedMonths === 12) {
          this.monthlyAttendanceData = monthlyPercentages;
          this.setAttendanceChart();
        }
      });
    }
  }


  async getAttendanceForMonth(year: number, month: number, callback: (percentage: number) => void) {
    (await this.attendanceService.getAttendanceAdmin(year, month)).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const totalDays = res.data.length;
          const presentDays = res.data.filter((attendance: any) => attendance.status === 'present').length;
          const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
          callback(percentage);
        } else {
          console.warn(`No attendance data for ${month} of ${year}`);
          callback(0);
        }
      },
      error: (error) => {
        console.error('Error retrieving attendance data for month', month, error);
        callback(0);
      }
    });
  }

  setAttendanceChart() {
    this.attendanceChart = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false
        },
      },
      series: [
        {
          name: 'Attendance Percentage',
          data: this.monthlyAttendanceData,
        },
      ],
      xaxis: {
        categories: this.months,
      },
      yaxis: {
        title: {
          text: 'Attendance Percentage',
        },
        min: 0,
        max: 100,
      },
      tooltip: {
        shared: true,
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          const attendance = w.globals.series[seriesIndex][dataPointIndex] !== undefined ? w.globals.series[seriesIndex][dataPointIndex] : 0;
          return `<div class="apexcharts-tooltip-title" style="color: #2A3547">${w.config.xaxis.categories[dataPointIndex]}</div>
                  <div class="apexcharts-tooltip-title" style="color: #2A3547;">Attendance: ${attendance}%</div>`;
        },
        theme: 'dark',
      }
    };
  }


  onMonthChange(): void {
    if (this.month) {
      const [year, month] = this.month.split('-');
      this.year = year;
      this.getAttendanceList(this.year, parseInt(month));
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }

}
