import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UntypedFormGroup, } from '@angular/forms';
import { Router } from '@angular/router';
import { format, differenceInMinutes, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isBefore } from 'date-fns';
import { AttendanceService } from '../attendance.service';

import { BehaviorSubject } from 'rxjs';

import Swal from "sweetalert2";
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.css'],
  // providers: [JobListService, DecimalPipe]
})
export class EmployeeAttendanceComponent {
  refresh: BehaviorSubject<any> = new BehaviorSubject(undefined);

  year: string;
  month: string;
  user: any;
  userId: any;

  events: any[] = []; // Array to store calendar events
  presentCount: number = 0;
  halfDayCount: number = 0;
  absentCount: number = 0;
  totalDaysCount: number = 0;

  // Declare the attendance list
  attendanceList: any[] = [];

  // bread crumb items
  breadCrumbItems: Array<{}>;
  jobListForm!: UntypedFormGroup;
  submitted = false;

  // Table data
  content?: any;
  lists?: any;
  total: Observable<number>;
  totalWorkHours: any;


  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 20;
  currentPage: number = 1;
  loadingTrans: boolean = false;
  filterBy: string = "";
  holidayData: any[];
  filteredHolidayData: any[];
  filterByName: string = 'all';
  selectedEmployeeName: string = ''; 
  employeeData: any;
  constructor(private attendanceService: AttendanceService,
    private employeeService: EmployeeManagementService,
    public router: Router,) { }

    ngOnInit(): void {
      this.breadCrumbItems = [
        { label: "Attendance" },
        { label: "My Attendance", active: true },
      ];
      this.user = JSON.parse(localStorage.getItem('payoutUser'));
      this.userId = this.user?.user?.id;
      this.breadCrumbItems = [{ label: 'Employee' }, { label: 'Attendance', active: true }];
      const currentDate = new Date();
      this.year = currentDate.getFullYear().toString();
      const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      this.month = `${this.year}-${currentMonth}`;  
      this.getAttendanceList(this.year, currentMonth);
      this.getHolidayList();
      this.getEmployee();
    }
    

    // Helper method to format month and year consistently
private formatMonthYear(month: string): { year: string, month: string } {
  const [year, monthValue] = month.split('-');
  return {
    year: year,
    month: monthValue.padStart(2, '0')
  };
}


onMonthChange(): void {
  if (this.month) {
    const { year, month } = this.formatMonthYear(this.month);
    this.getAttendanceList1(year, month);
  }
}

onEmployeeSelect() {
  const selectedEmployee = this.employeeData.find(emp => emp.id === this.filterByName);
  if (selectedEmployee) {
    this.filterByName = selectedEmployee.id;
    this.selectedEmployeeName = `${selectedEmployee.basicDetails.firstName} ${selectedEmployee.basicDetails.lastName}`;
  }
  const { year, month } = this.formatMonthYear(this.month);
  this.getAttendanceList1(year, month); 
}


  // onMonthChange(): void {
  //   debugger
  //   if (this.month) {
  //     const [year, month] = this.month.split('-');
  //     const yearNumber = parseInt(year, 10);
  //     let monthNumber = parseInt(month, 10);
  //     const formattedMonth = monthNumber.toString().padStart(2, '0');
  //     const formattedYear = yearNumber.toString();
  //     this.getAttendanceList1(formattedYear, formattedMonth);
  //   }
  // }

  // onEmployeeSelect() {
  //   debugger;
  //   const selectedEmployee = this.employeeData.find(emp => emp.id === this.filterByName);
  //   if (selectedEmployee) {
  //     this.filterByName = selectedEmployee.id;
  //     this.selectedEmployeeName = `${selectedEmployee.basicDetails.firstName} ${selectedEmployee.basicDetails.lastName}`;
  //   }
  //   if (this.month.includes('-')) {
  //     const [year, month] = this.month.split('-');
  //     this.year = year;
  //     this.month = month.padStart(2, '0');
  //   }
  //   this.getAttendanceList(this.year, this.month);
  // }
  
  

  async getEmployee() {
    (await this.employeeService.getEmployeeList()).subscribe((res) => {
      if (res && res.data) {
        this.employeeData = res.data.sort((a, b) => {
          const nameA = a.basicDetails.firstName.toLowerCase();
          const nameB = b.basicDetails.firstName.toLowerCase(); 
          if (nameA < nameB) {
            return -1; 
          }
          if (nameA > nameB) {
            return 1; 
          }
          return 0; 
        });
      }
    });
  }
  isHoliday(day: Date): boolean {
    return this.filteredHolidayData.some((holiday) => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          if (isSameDay(d, day)) {
            return true;
          }
        }
      }
      return false;
    });
  }
  async getHolidayList() {
    // this.apiService.startLoader();
    (await this.attendanceService.getHoliday()).subscribe((res: any[]) => {
      this.holidayData = res;
      this.filteredHolidayData = [...this.holidayData];
      // this.apiService.stopLoader();
    });
  }
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }

  navigateToAttendanceDetails(id: any) {
    this.router.navigate(['attendance/details/' + id]);
  }
  //pagination

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.offset = (this.currentPage - 1) * this.limit;
    this.getAttendanceList(this.year, this.month);
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getAttendanceList(this.year, this.month)
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRecords / this.limit);
    const currentPage = Math.ceil((this.offset + 1) / this.limit);
    const maxPagesToShow = 5;

    let startPage: number, endPage: number;
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfPagesToShow = Math.floor(maxPagesToShow / 2);
      if (currentPage <= halfPagesToShow) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + halfPagesToShow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfPagesToShow;
        endPage = currentPage + halfPagesToShow;
      }
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  goToPage(pageNumber: number): void {
    this.offset = (pageNumber - 1) * this.limit;
    this.currentPage = pageNumber;
    this.getAttendanceList(this.year, this.month)
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecords) {
      this.offset += this.limit;
      this.currentPage++;
      this.getAttendanceList(this.year, this.month);
    } else {

    }
  }


  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 5;
    this.getAttendanceList(this.year, this.month)
  }

  filter() {
    this.resetToPageOne();
  }

  

getStatusCount(dailyAttendance: any[], status: string): number {
  let count = 0;
  dailyAttendance.forEach((entry) => {
    if (entry.status === status) {
      count++;
    }
  });
  return count;
}

async getAttendanceList(year: string, month: string) {
  let search: any = {};
  if (this.filterByName !== 'all' && this.filterByName !== '') {
    search.employeeId = this.filterByName;
  }

  const fullDayDuration = 8 * 60; // Full day in minutes (480 minutes)
  const halfDayMinDuration = 4 * 60; // Half day in minutes (240 minutes)
  let attendanceData = [];
  (await this.attendanceService.getAttendance(year, month, this.offset, this.limit, search)).subscribe(
    (response) => {
      const today = new Date();
      const startOfMonthDate = startOfMonth(today);
      const endOfMonthDate = endOfMonth(today);
      const daysInMonth = eachDayOfInterval({
        start: startOfMonthDate,
        end: endOfMonthDate,
      });

      let holidayCount = 0;
      let workdays = daysInMonth.filter((day) => {
        const dayOfWeek = day.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return false; // Skip weekends
        }
        if (this.isHoliday(day)) {
          holidayCount++;
          return false; // Skip holidays
        }
        return true;
      });

      const totalWorkDays = workdays.length;
      const totalDaysInMonth = daysInMonth.length;
      response.data.forEach((employeeAttendance) => {
        let employeeRecord = attendanceData.find(
          (data) => data.userId === employeeAttendance.user.id
        );

        if (!employeeRecord) {
          employeeRecord = {
            userId: employeeAttendance.user.id,
            empName: `${employeeAttendance.user.firstName} ${employeeAttendance.user.lastName}`,
            totalDays: totalDaysInMonth,
            holidayCount: holidayCount,
            totalWorkDays: totalWorkDays,
            present: 0,
            absent: 0,
            halfDay: 0,
            attendancePercentage: '0%',
            dailyAttendance: [],
          };
          attendanceData.push(employeeRecord);
        }

        let presentCount = 0;
        let halfDayCount = 0;
        let absentCount = 0;

        // Iterate over each workday to calculate attendance for the employee
        workdays.forEach((day) => {
          if (isBefore(day, today) || isSameDay(day, today)) { // Exclude today
            const existingRecord = employeeRecord.dailyAttendance.find(attendance => attendance.day === format(day, 'yyyy-MM-dd'));

            if (existingRecord) {
              // If there's already a record for this day, skip it (avoid duplicate entries)
              return;
            }

            const checkInLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkIn' && isSameDay(new Date(log.time), day));
            const checkOutLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkOut' && isSameDay(new Date(log.time), day));

            let label = 'Absent';
            let totalDuration = 0;

            // If there is at least one valid check-in and check-out pair
            if (checkInLogs.length > 0 && checkOutLogs.length > 0) {
              for (let i = 0; i < Math.min(checkInLogs.length, checkOutLogs.length); i++) {
                const checkInTime = new Date(checkInLogs[i].time);
                const checkOutTime = new Date(checkOutLogs[i].time);

                // Calculate the duration for this pair
                const durationForThisPair = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60); // Duration in minutes
                totalDuration += durationForThisPair;
              }

              // Apply logic for Present, Half Day, and Absent based on total duration
              if (totalDuration >= fullDayDuration) {
                label = 'Present';
                presentCount++;
              } else if (totalDuration >= halfDayMinDuration && totalDuration < fullDayDuration) {
                label = 'Half Day';
                halfDayCount++;
              } else {
                label = 'Absent';
                absentCount++;
              }
            } 
            // If there's no check-out but at least one check-in
            else if (checkInLogs.length > 0 && checkOutLogs.length === 0) {
              label = 'Absent'; // Mark as Absent if there is no check-out
              absentCount++;
            }
            // If there's no check-in and no check-out logs, mark as Absent
            else {
              label = 'Absent';
              absentCount++;
            }

            // Add daily attendance record (even if no valid pair)
            employeeRecord.dailyAttendance.push({
              day: format(day, 'yyyy-MM-dd'),
              status: label,
              workDuration: totalDuration / 60, // Convert minutes to hours
            });

          }
        });

        // Calculate the attendance percentage directly from dailyAttendance
        const totalAttendanceDays = employeeRecord.dailyAttendance.reduce((total, record) => {
          if (record.status === 'Present') {
            return total + 1;
          } else if (record.status === 'Half Day') {
            return total + 0.5;
          }
          return total; // Absent days are not counted
        }, 0);

        const attendancePercentage = ((totalAttendanceDays / totalWorkDays) * 100).toFixed(2);
        employeeRecord.attendancePercentage = `${attendancePercentage}%`;
        employeeRecord.present = presentCount;
        employeeRecord.absent = absentCount;
        employeeRecord.halfDay = halfDayCount;
      });

      // Set the final attendance data
      this.attendanceList = attendanceData;
      this.totalRecords = response?.totalRecord || 0;
      this.getPageNumbers();
      this.refresh.next(undefined); // Trigger refresh
    },
    (error) => {
      console.error('Error fetching attendance data', error);
    }
  );
}


// async getAttendanceList(year: string, month: string) {
//   let search: any = {};
//   if (this.filterByName !== 'all' && this.filterByName !== '') {
//     search.employeeId = this.filterByName;
//   }

//   const fullDayDuration = 8 * 60; // Full day in minutes (480 minutes)
//   const halfDayMinDuration = 4 * 60; // Half day in minutes (240 minutes)
//   let attendanceData = [];

//   console.log("Fetching attendance data for year:", year, "month:", month); // Debug log

//   // Fetch attendance data from the API
//   (await this.attendanceService.getAttendance(year, month, this.offset, this.limit, search)).subscribe(
//     (response) => {
//       const today = new Date();
//       const startOfMonthDate = startOfMonth(today);
//       const endOfMonthDate = endOfMonth(today);
//       const daysInMonth = eachDayOfInterval({
//         start: startOfMonthDate,
//         end: endOfMonthDate,
//       });

//       let holidayCount = 0;
//       let workdays = daysInMonth.filter((day) => {
//         const dayOfWeek = day.getDay();
//         if (dayOfWeek === 0 || dayOfWeek === 6) {
//           return false; // Skip weekends
//         }
//         if (this.isHoliday(day)) {
//           holidayCount++;
//           return false; // Skip holidays
//         }
//         return true;
//       });

//       const totalWorkDays = workdays.length;
//       const totalDaysInMonth = daysInMonth.length;

//       console.log("Total Work Days:", totalWorkDays); // Debug log
//       console.log("Total Days in Month:", totalDaysInMonth); // Debug log

//       // Loop through each employee's data
//       response.data.forEach((employeeAttendance) => {
//         let employeeRecord = attendanceData.find(
//           (data) => data.userId === employeeAttendance.user.id
//         );

//         if (!employeeRecord) {
//           employeeRecord = {
//             userId: employeeAttendance.user.id,
//             empName: `${employeeAttendance.user.firstName} ${employeeAttendance.user.lastName}`,
//             totalDays: totalDaysInMonth,
//             holidayCount: holidayCount,
//             totalWorkDays: totalWorkDays,
//             present: 0,
//             absent: 0,
//             halfDay: 0,
//             attendancePercentage: '0%',
//             dailyAttendance: [],
//           };
//           attendanceData.push(employeeRecord);
//         }

//         let presentCount = 0;
//         let halfDayCount = 0;
//         let absentCount = 0;

//         // Iterate over each workday to calculate attendance for the employee
//         workdays.forEach((day) => {
//           if (isBefore(day, today) || isSameDay(day, today)) { // Exclude today
//             const existingRecord = employeeRecord.dailyAttendance.find(attendance => attendance.day === format(day, 'yyyy-MM-dd'));

//             if (existingRecord) {
//               // If there's already a record for this day, skip it (avoid duplicate entries)
//               return;
//             }

//             const checkInLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkIn' && isSameDay(new Date(log.time), day));
//             const checkOutLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkOut' && isSameDay(new Date(log.time), day));

//             let label = 'Absent';
//             let totalDuration = 0;

//             if (checkInLogs.length === checkOutLogs.length) {
//               // Iterate through each pair of checkIn and checkOut logs
//               for (let i = 0; i < checkInLogs.length; i++) {
//                 const checkInTime = new Date(checkInLogs[i].time);
//                 const checkOutTime = new Date(checkOutLogs[i].time);

//                 // Calculate the duration for this pair of checkIn/checkOut
//                 const durationForThisPair = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60); // Duration in minutes
//                 totalDuration += durationForThisPair; // Accumulate the duration
//                 console.log("Duration for this pair (minutes):", durationForThisPair); // Debug log
//               }

//               // Now totalDuration contains the total work duration for the day
//               console.log("Total work duration for the day (minutes):", totalDuration);

//               // Apply logic for Present, Half Day, and Absent
//               if (totalDuration >= fullDayDuration) {
//                 label = 'Present';
//                 presentCount++;
//               } else if (totalDuration >= halfDayMinDuration && totalDuration < fullDayDuration) {
//                 label = 'Half Day';
//                 halfDayCount++;
//               } else {
//                 label = 'Absent';
//                 absentCount++;
//               }
//             } else {
//               console.log("Mismatched checkIn and checkOut logs for the day");
//               label = 'Absent';  // If there are mismatched logs, consider as absent
//               absentCount++;
//             }

//             // Add daily attendance record (only once per day)
//             employeeRecord.dailyAttendance.push({
//               day: format(day, 'yyyy-MM-dd'),
//               status: label,
//               workDuration: totalDuration / 60, // Convert minutes to hours
//             });

//             // Debug log for daily attendance
//             console.log(`Employee: ${employeeAttendance.user.firstName} ${employeeAttendance.user.lastName} - Day: ${format(day, 'yyyy-MM-dd')} - Status: ${label}`);
//           }
//         });

//         // Calculate the attendance percentage directly from dailyAttendance
//         const totalAttendanceDays = employeeRecord.dailyAttendance.reduce((total, record) => {
//           if (record.status === 'Present') {
//             return total + 1; // Count full days as 1
//           } else if (record.status === 'Half Day') {
//             return total + 0.5; // Count half days as 0.5
//           }
//           return total; // Absent days are not counted
//         }, 0);

//         const attendancePercentage = ((totalAttendanceDays / totalWorkDays) * 100).toFixed(2);
//         employeeRecord.attendancePercentage = `${attendancePercentage}%`;

//         // Debug log for attendance percentage
//         console.log(`Attendance Percentage for ${employeeAttendance.user.firstName} ${employeeAttendance.user.lastName}: ${attendancePercentage}%`);

//         // Update employee attendance summary
//         employeeRecord.present = presentCount;
//         employeeRecord.absent = absentCount;
//         employeeRecord.halfDay = halfDayCount;
//       });

//       // Set the final attendance data
//       this.attendanceList = attendanceData;
//       this.totalRecords = response?.totalRecord || 0;
//       this.getPageNumbers();
//       this.refresh.next(undefined); // Trigger refresh

//       // Debug log for final attendance data
//       console.log("Final Attendance Data:", attendanceData);
//     },
//     (error) => {
//       console.error('Error fetching attendance data', error);
//     }
//   );
// }

async getAttendanceList1(year, month) {
  let search: any = {};
  if (this.filterByName !== 'all' && this.filterByName !== '') {
    search.employeeId = this.filterByName;
  }

  const fullDayDuration = 8 * 60; // Full day in minutes (480 minutes)
  const halfDayMinDuration = 4 * 60; // Half day in minutes (240 minutes)
  let attendanceData = [];
  const startOfMonthDate = new Date(year, month - 1, 1); // month is 0-based, so subtract 1
  const endOfMonthDate = new Date(year, month, 0); // Get the last day of the month

  // Create the daysInMonth array for the selected month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonthDate,
    end: endOfMonthDate,
  });

  let holidayCount = 0;
  let workdays = daysInMonth.filter((day) => {
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false; // Skip weekends (Saturday and Sunday)
    }
    if (this.isHoliday(day)) {
      holidayCount++;
      return false; // Skip holidays
    }
    return true;
  });

  const totalWorkDays = workdays.length;
  const totalDaysInMonth = daysInMonth.length;
  (await this.attendanceService.getAttendance(year, month, this.offset, this.limit, search)).subscribe(
    (response) => {
      const today = new Date();

      // Loop through each employee's data
      response.data.forEach((employeeAttendance) => {
        let presentCount = 0;
        let halfDayCount = 0;
        let absentCount = 0;

        let employeeRecord = attendanceData.find(
          (data) => data.userId === employeeAttendance.user.id
        );

        if (!employeeRecord) {
          employeeRecord = {
            userId: employeeAttendance.user.id,
            empName: `${employeeAttendance.user.firstName} ${employeeAttendance.user.lastName}`,
            totalDays: totalDaysInMonth,
            holidayCount: holidayCount,
            totalWorkDays: totalWorkDays,
            present: 0,
            absent: 0,
            halfDay: 0,
            attendancePercentage: '0%',
            dailyAttendance: [],
          };
          attendanceData.push(employeeRecord);
        }

        // Iterate over each workday to calculate attendance for the employee
        workdays.forEach((day) => {
          if (isBefore(day, today) || isSameDay(day, today)) { // Exclude today
            const existingRecord = employeeRecord.dailyAttendance.find(attendance => attendance.day === format(day, 'yyyy-MM-dd'));

            if (existingRecord) {
              // If there's already a record for this day, skip it (avoid duplicate entries)
              return;
            }

            const checkInLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkIn' && isSameDay(new Date(log.time), day));
            const checkOutLogs = employeeAttendance.entrylogs.filter(log => log.action === 'checkOut' && isSameDay(new Date(log.time), day));

            let label = 'Absent';
            let totalDuration = 0;

            if (checkInLogs.length === checkOutLogs.length && checkInLogs.length > 0) {
              // Iterate through each pair of checkIn and checkOut logs
              for (let i = 0; i < checkInLogs.length; i++) {
                const checkInTime = new Date(checkInLogs[i].time);
                const checkOutTime = new Date(checkOutLogs[i].time);

                // Calculate the duration for this pair of checkIn/checkOut
                const durationForThisPair = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60); // Duration in minutes
                totalDuration += durationForThisPair; // Accumulate the duration
              }

              // Apply logic for Present, Half Day, and Absent
              if (totalDuration >= fullDayDuration) {
                label = 'Present';
                presentCount++;
              } else if (totalDuration >= halfDayMinDuration && totalDuration < fullDayDuration) {
                label = 'Half Day';
                halfDayCount++;
              } else {
                label = 'Absent';
                absentCount++;
              }
            } else {
              label = 'Absent';  // If there are mismatched logs, consider as absent
              absentCount++;
            }

            // Add daily attendance record (only once per day)
            employeeRecord.dailyAttendance.push({
              day: format(day, 'yyyy-MM-dd'),
              status: label,
              workDuration: totalDuration / 60, // Convert minutes to hours
            });
          }
        });
        const totalAttendanceDays = employeeRecord.dailyAttendance.reduce((total, record) => {
          if (record.status === 'Present') {
            return total + 1; // Count full days as 1
          } else if (record.status === 'Half Day') {
            return total + 0.5; // Count half days as 0.5
          }
          return total; // Absent days are not counted
        }, 0);
        const attendancePercentage = ((totalAttendanceDays / totalWorkDays) * 100).toFixed(2);
        employeeRecord.attendancePercentage = `${attendancePercentage}%`;
      });

      // Set the final attendance data
      this.attendanceList = attendanceData;
      this.totalRecords = response?.totalRecord || 0;
      this.getPageNumbers();
      this.refresh.next(undefined); // Trigger refresh
    },
    (error) => {
      console.error('Error fetching attendance data', error);
    }
  );
}

}
