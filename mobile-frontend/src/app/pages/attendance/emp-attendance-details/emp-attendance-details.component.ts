import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../attendance.service';
import { startOfMonth, eachDayOfInterval, isSameDay, format, differenceInMinutes } from 'date-fns';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-emp-attendance-details',
  templateUrl: './emp-attendance-details.component.html',
  styleUrls: ['./emp-attendance-details.component.css']
})
export class EmpAttendanceDetailsComponent implements OnInit {
  refresh: BehaviorSubject<any> = new BehaviorSubject(undefined);
  year: string;
  month: string;
  userId: any;
  attendanceList: any[] = [];
  presentCount: number = 0;
  halfDayCount: number = 0;
  absentCount: number = 0;
  holidayData: any[];
  totalDaysCount: number = 0;
  filteredHolidayData: any[];
  totalDaysInMonth: number = 0;
  holidayCount: number = 0;
  totalWorkDays: number;
  constructor(
    private attendanceService: AttendanceService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.userId = this.activeRoute.snapshot.paramMap.get('id');

    this.year = this.getCurrentYear().toString();
    
    const currentMonth = this.getCurrentMonth().toString().padStart(2, '0');

    this.month = `${this.year}-${currentMonth}`;

    if (this.userId) {
      this.getAttendanceEmpList(this.year, currentMonth, this.userId);
    }

    this.getHolidayList();
  }

  async getHolidayList() {
    (await this.attendanceService.getHoliday()).subscribe((res: any[]) => {
      this.holidayData = res;
      this.filteredHolidayData = [...this.holidayData];
    });
  }

  isHoliday(day: Date): boolean {
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true; 
    }
    return this.filteredHolidayData.some((holiday) => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isSameDay(d, day)) {
          return true;
        }
      }
      return false;
    });
  }
  
  
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }

  async getAttendanceEmpList(year, month, userId: string) {
    const fullDayDuration = 8 * 60; // Full day in minutes (480 minutes)
    const halfDayMinDuration = 4 * 60; // Half day in minutes (240 minutes)
    this.presentCount = 0;
    this.halfDayCount = 0;
    this.absentCount = 0;
    this.holidayCount = 0;
    this.attendanceList = [];
  
    const startOfMonthDate = new Date(year, month - 1, 1);  // Start of the month
    const endOfMonthDate = new Date(year, month, 0); // Last day of the month
    const currentDate = new Date(); // Current date
  
    // Fetch the attendance data for the employee
    (await this.attendanceService.getAttendanceEmp(year, month, userId)).subscribe(
      (response) => {
        // Filter holidays to include only those in the current month
        this.filteredHolidayData = this.holidayData.filter((holiday) => {
          const holidayDate = new Date(holiday.startDate);
          return holidayDate.getFullYear() === year && holidayDate.getMonth() + 1 === month;
        });
        const daysInMonth = eachDayOfInterval({
          start: startOfMonthDate,
          end: endOfMonthDate,
        });
  
        // Total number of days in the month (this includes holidays and weekends)
        this.totalDaysInMonth = daysInMonth.length;
        const filteredDaysInMonth = daysInMonth.filter((day) => day <= currentDate);
        // Calculate attendance status for each day up to today
        this.attendanceList = filteredDaysInMonth.map((day) => {
          const dayOfWeek = format(day, 'iiii'); // Get day of the week (e.g., Monday, Tuesday)
          const dayNumber = day.getDay(); // Get day number (0 = Sunday, 1 = Monday, etc.)
          let status = 'Absent'; // Default status
  
          // Check if the day is a holiday
          if (this.isHoliday(day)) {
            status = 'Weekend';
            this.holidayCount++;
          }
  
          // Find attendance record for the day
          const record = response.find((r) => isSameDay(new Date(r.entrylogs[0].time), day));
  
          if (record) {
            const checkInLogs = record.entrylogs.filter(log => log.action === 'checkIn' && isSameDay(new Date(log.time), day));
            const checkOutLogs = record.entrylogs.filter(log => log.action === 'checkOut' && isSameDay(new Date(log.time), day));
  
            let totalDuration = 0; // To accumulate total work duration for the day
  
            // If there are check-in/check-out logs
            if (checkInLogs.length === checkOutLogs.length && checkInLogs.length > 0) {
              for (let i = 0; i < checkInLogs.length; i++) {
                const checkInTime = new Date(checkInLogs[i].time);
                const checkOutTime = new Date(checkOutLogs[i].time);
  
                // Calculate the duration for this pair of checkIn/checkOut
                const durationForThisPair = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60); // Duration in minutes
                totalDuration += durationForThisPair; // Accumulate the duration
              }
              if (totalDuration >= fullDayDuration) {
                status = 'Present';
                this.presentCount++;
              } else if (totalDuration >= halfDayMinDuration && totalDuration < fullDayDuration) {
                status = 'Half Day';
                this.halfDayCount++;
              } else {
                status = 'Absent';
              }
            } else {
              status = 'Absent'; // If there are mismatched logs, consider as absent
            }
          }
  
          // Exclude weekends (Saturday and Sunday) from absent count
          if (status === 'Absent' && dayNumber !== 0 && dayNumber !== 6) {
            this.absentCount++;
          }
  
          return {
            date: format(day, 'dd/MM/yyyy'), // Format the date as 'dd/MM/yyyy'
            day: dayOfWeek, // Day of the week (e.g., Monday)
            status: status, // Status (Present, Half Day, Absent, Holiday)
          };
        });
  
        // Calculate total workdays (1st to last day of the month, excluding weekends and holidays)
        let totalWorkDays = 0;
        for (let day of daysInMonth) {
          const dayOfWeek = day.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  
          // If the day is a weekday and not a holiday
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && !this.isHoliday(day)) {
            totalWorkDays++;
          }
        }
        this.totalWorkDays = totalWorkDays;
        // Update total holiday count
        this.holidayCount = this.filteredHolidayData.length;
        this.refresh.next(undefined);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching attendance data', error);
      }
    );
  }
  
convertToHours(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours + minutes / 60 + seconds / 3600;
}


onMonthChange(): void {
  if (this.month) {
    const [year, month] = this.month.split('-');
    const yearNumber = parseInt(year, 10);
    let monthNumber = parseInt(month, 10);
    const formattedMonth = monthNumber.toString().padStart(2, '0');
    const formattedYear =  yearNumber.toString();
    this.getAttendanceEmpList(formattedYear, formattedMonth, this.userId);
  }
}

}
