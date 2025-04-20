import { Component, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions, EventClickArg, EventApi } from '@fullcalendar/core';;
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { category, calendarEvents, createEventId } from './data';
//import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';
import { AttendanceService } from '../attendance.service';
import { startOfMonth, eachDayOfInterval, isSameDay, startOfDay, endOfDay, isSameMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Subject } from 'rxjs';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { DatePipe } from '@angular/common';
import { LeaveCalendarService } from '../../leave-calendar/leave-calendar.service';
@Component({
  selector: 'app-attendance-dashboard',
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css'],
  providers: [DatePipe]
})
export class AttendanceDashboardComponent {

  // public presentCount: number = 0;
  // public halfDayCount: number = 0;
  // public absentCount: number = 0;

  totalDaysInMonth: number = 0; // Declare the property
  presentCount: number = 0;
  halfDayCount: number = 0;
  absentCount: number = 0;
  lateMarkCount: number = 0;
  leaveCount: number = 0;
  totalHoursToday: string = '--';
  totalHoursWeek: string = '--';
  totalHoursMonth: string = '--';
  breadCrumbItems: Array<{}>;
  hasCheckedIn = false;
  hasCheckedOut = false;
  userId: any;
  employeeId: any;
  year: string;
  month: string;
  pairedLogs = [];
  events: any[] = [];
  refresh = new Subject<void>();
  user: any;
  entryLogs: any;
  todayDateAndTime: string;
  selectedMonth: number;
  selectedYear: number;
  viewDate: Date = new Date();
  firstCheckInTime: string | null = null;  // Variable to store the first check-in time

  @ViewChild('modalShow') modalShow: TemplateRef<any>;
  @ViewChild('editmodalShow') editmodalShow: TemplateRef<any>;
  currentEvents: EventApi[] = [];
  checkINDATA: any;
  formattedTime: string;
  formEditData: UntypedFormGroup;
  submitted = false;
  category: any[];
  newEventDate: any;
  editEvent: any;
  calendarEvents: any[];
  // event form
  formData: UntypedFormGroup;
  counterLabel = '00:00:00 Hrs';
  counterInSeconds = null;
  counterInstance;
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
    ],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prevYear,prev,next,nextYear',
    },
    initialView: 'dayGridMonth',
    themeSystem: 'bootstrap',
    events: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.openModal.bind(this),

    eventContent: (info) => {
      const eventTitle = info.event.title;
      const totalWorkHours = info.event.extendedProps.totalWorkHours;

      // Get today's date
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth(); // months are 0-indexed
      const currentYear = today.getFullYear();

      // Get the date of the event
      const eventDate = new Date(info.event.start);

      // Check if the event is for the current day
      const isCurrentDay = eventDate.getDate() === currentDay && eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;

      // Return content based on whether it's the current day or not
      return {
        html: `
          <div class="event-content" style="display: flex; flex-direction: column; align-items: flex-start; color: #fff;">
            <div class="event-duration" style="font-size: 0.9rem;">
              Duration: ${totalWorkHours || "0h 0m 0s"}
            </div>
            ${!isCurrentDay ? `<div class="event-title" style="font-size: 1rem; margin-bottom: 5px;">${eventTitle}</div>` : ''}
          </div>
        `,
      };
    },

    eventDidMount: (info) => {
      const isAllDayEvent = info.event.allDay;
      if (!isAllDayEvent) {
        info.el.querySelector('.fc-event-time')?.classList.add('hide-event-time');
      }
    },
    datesSet: (dateInfo) => {
      const currentMonth = dateInfo.view.currentStart.getMonth();
      const currentYear = dateInfo.view.currentStart.getFullYear();
      if (this.selectedMonth !== currentMonth || this.selectedYear !== currentYear) {
        if (currentMonth < this.selectedMonth || (currentMonth === 11 && this.selectedMonth === 0)) {
          this.preMonth();
        }
        else if (currentMonth > this.selectedMonth || (currentMonth === 0 && this.selectedMonth === 11)) {
          this.nextMonth();
        }
      }
      this.selectedMonth = currentMonth;
      this.selectedYear = currentYear;
    },
  };
  totalWorkHoursToday: number;
  totalWorkHoursWeek: number;
  totalWorkHoursMonth: number;
  userName: any;
  selectedAttendanceId!: string;
  @ViewChild('timesheetModal') timesheetModal!: TemplateRef<any>;

  ngOnInit(): void {

    // this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    // Retrieve the first name from the user data
    this.userName = this.user?.employee?.basicDetails.firstName;
    this.userId = this.user?.user?.id;
    this.employeeId = this.user?.employee?.id;
    this.breadCrumbItems = [{ label: 'Attendance' }, { label: 'Dashboard', active: true }];
    this.year = this.getCurrentYear().toString();
    this.month = this.getCurrentMonth().toString();
    // Get the current date and time
    const currentDate = new Date();
    this.todayDateAndTime = this.datePipe.transform(currentDate, 'hh:mm a, dd MMM yyyy');
    this.firstCheckInTime = localStorage.getItem('firstCheckInTime');
    this.getLeaveData(this.year, this.month);
    this.getAttendanceEmp(this.year, this.month, this.userId);
    this.getEmployee();

  }



  preMonth() {
    let newMonth = this.selectedMonth - 1;
    let newYear = this.selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    this.selectedMonth = newMonth;
    this.selectedYear = newYear;
    this.getAttendanceEmp(newYear, newMonth + 1, this.userId);
  }

  nextMonth() {
    let newMonth = this.selectedMonth + 1;
    let newYear = this.selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    this.selectedMonth = newMonth;
    this.selectedYear = newYear;
    this.getAttendanceEmp(newYear, newMonth + 1, this.userId);
  }

  constructor(
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private leaveService: LeaveCalendarService,
    private employeeService: EmployeeManagementService,
    private datePipe: DatePipe
  ) { }

  // openTimesheetModal(attendanceId: string) {
  //   this.selectedAttendanceId = attendanceId;
  //   this.modalService.open(this.timesheetModal, { size: 'lg', backdrop: 'static' });
  // }
  openTimesheetModal(content:any) {
    this.modalService.open(this.timesheetModal, { size: 'lg', backdrop: 'static' });
  }

  startCounter() {
    this.counterInstance = setInterval(() => {
      this.counterInSeconds++;
      this.convertSecondsToTimeLabel();
    }, 1000);
  }

  stopCounter() {
    clearInterval(this.counterInstance);
  }

  openModal(event?: any) {
    this.newEventDate = undefined;
    this.newEventDate = event;

    this.getAttendanceEmpDayWise(this.year, this.month, event?.dateStr.substring(8, 10), this.userId)
      .then((response) => {
        // Once response is received, open the modal
        this.modalService.open(this.modalShow);
      })
      .catch((error) => {
        console.error('Error fetching attendance data:', error);
        // Handle error (optional)
      });
  }



  closeEventModal() {
    this.formData = this.formBuilder.group({
      title: '',
      category: '',
    });
    this.modalService.dismissAll();
  }

  handleDrop(event: any): void {
    this.calendarEvents.push({
      title: event.item.data,
      date: event.dateStr,
    });
  }

  convertSecondsToTimeLabel() {
    const totalSeconds = this.counterInSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);
    this.counterLabel = `${hours}h ${minutes}m ${seconds}s`;
  }
  convertMinutesToHMSS(minutes: number): string {
    const hours = Math.floor(minutes / 60); // Calculate total hours
    const remainingMinutes = Math.floor(minutes % 60); // Calculate remaining minutes
    const seconds = Math.round((minutes % 1) * 60); // Calculate remaining seconds

    return `${hours}h ${remainingMinutes}m ${seconds}s`; // Return the formatted duration
  }

  async getAttendanceEmp(year: any, month: any, userId: string) {
    const fullDayDuration = 8; // Full day work duration (8 hours)
    const halfDayMinDuration = 4; // Half day minimum duration (4 hours)

    this.presentCount = 0;
    this.halfDayCount = 0;
    this.absentCount = 0;
    this.lateMarkCount = 0; // Add a variable to track late marks

    let totalWorkHoursToday = 0;
    let totalWorkHoursWeek = 0;
    let totalWorkHoursMonth = 0;

    const today = new Date();
    const currentDay = today.getDate(); // Today's date (e.g. 17)
    const currentMonth = today.getMonth(); // Current month (0 for January, 1 for February, etc.)

    const currentWeekStartDate = startOfWeek(today);
    const currentWeekEndDate = endOfWeek(today);

    // Calculate total days in the current month
    const startOfMonthDate = new Date(year, month - 1, 1);
    const endOfMonthDate = new Date(year, month, 0); // Get the last day of the month
    this.totalDaysInMonth = endOfMonthDate.getDate(); // Get the last day as total days in month
    // Fetch attendance data
    (await this.attendanceService.getAttendanceEmp(year, month, userId)).subscribe(
      (response) => {
        if (!response || response.length === 0) {
          this.events = [];
          this.refresh.next();
          return;
        }

        // **Here we call handleCurrentDay after receiving the response**


        const daysInMonth = eachDayOfInterval({
          start: startOfMonthDate,
          end: today, // Bind until today (current date)
        });

        this.events = daysInMonth.map((day) => {
          const dayOfWeek = day.getDay();

          // Skip weekends (Saturday and Sunday)
          if (dayOfWeek === 6 || dayOfWeek === 0) {
            return null; // Skip weekends
          }

          const record = response.find((r) => {
            const entryLogs = r.entrylogs;
            if (!entryLogs || entryLogs.length === 0) {
              return false;
            }
            const checkinTime = entryLogs[0]?.time;
            if (!checkinTime) {
              return false;
            }

            const recordDate = new Date(checkinTime);
            if (isNaN(recordDate.getTime())) {
              return false;
            }
            return isSameDay(recordDate, day);
          });

          let eventTitle = "Absent";
          let eventClass = 'bg-danger';
          let lateMark = '';

          // Get check-in and check-out times
          const checkInTime = record ? new Date(record.entrylogs[0]?.time) : null;
          const checkoutTime = record && record.entrylogs ? new Date(record.entrylogs[record.entrylogs.length - 1]?.time) : null;

          // Set cutoff for late mark (10:15 AM)
          const checkInCutoff = new Date(year, month - 1, day.getDate(), 10, 15, 0, 0); // Set to 10:15 AM of the current day

          // Check if employee's check-in time exists and is later than the cutoff
          if (checkInTime && checkInTime instanceof Date && !isNaN(checkInTime.getTime()) && checkInTime > checkInCutoff) {
            lateMark = ' (Late Mark)';
            this.lateMarkCount++; // Increment the late mark count
          }

          // Calculate total work hours from sessions (minutes)
          const totalWorkHours = record && record.totalWorkHours ? record.totalWorkHours : 0;
          const totalWorkHoursInHours = totalWorkHours / 60; // Convert to hours

          // Format work hours
          const formattedWorkHours = this.convertMinutesToHMSS(totalWorkHours); // Convert minutes to "h m s"

          // Ensure work time is checked before classifying as absent
          if (totalWorkHoursInHours < 4 || totalWorkHoursInHours === 0 || totalWorkHours === null) {
            eventTitle = "Absent";
            eventClass = 'bg-danger';
            this.absentCount++; // Increment the absent count
          } else if (totalWorkHoursInHours >= halfDayMinDuration && totalWorkHoursInHours < fullDayDuration) { // Half Day (4 to 8 hours)
            eventTitle = "Half Day";
            eventClass = 'bg-warning';
            this.halfDayCount++;
          } else if (totalWorkHoursInHours >= fullDayDuration) { // Full Day (8 hours and more)
            eventTitle = "Present";
            eventClass = 'bg-success';
            this.presentCount++;
          }

          // Add total work hours for today, this week, and this month
          if (isSameDay(day, today)) {
            totalWorkHoursToday += totalWorkHoursInHours;
          }

          if (isWithinInterval(day, { start: currentWeekStartDate, end: currentWeekEndDate })) {
            totalWorkHoursWeek += totalWorkHoursInHours;
          }

          if (isSameMonth(day, new Date(year, month - 1))) {
            totalWorkHoursMonth += totalWorkHoursInHours;
          }

          return {
            id: record ? record.id : `${day.getTime()}`, // Unique ID for each event
            title: eventTitle + lateMark, // Event title with late mark
            start: startOfDay(day),
            end: endOfDay(day),
            className: eventClass,
            extendedProps: {
              totalWorkHours: formattedWorkHours, // Display formatted work hours
            },
          };
        }).filter((event) => event !== null);
        // Round the total work hours for display purposes
        this.totalWorkHoursToday = parseFloat(totalWorkHoursToday.toFixed(2));
        this.totalWorkHoursWeek = parseFloat(totalWorkHoursWeek.toFixed(2));
        this.totalWorkHoursMonth = parseFloat(totalWorkHoursMonth.toFixed(2));

        // Set events for the calendar
        this.calendarOptions.events = this.events;
        this.refresh.next();
        this.handleCurrentDay(response);
      },
      (error) => {
        console.error('Error fetching attendance data', error);
      }
    );
  }



  MinsToDisplaytime(hours: number) {
    if (isNaN(hours) || hours <= 0) {
      return "0:00";
    }

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h}:${m < 10 ? '0' + m : m}`;
  }

  async getAttendanceEmpDayWise(year: any, month: any, day: any, userId: string) {

    (await this.attendanceService.getAttendanceEmpDayWise(year, month, day, userId))
      .subscribe(response => {
        this.entryLogs = undefined;
        this.entryLogs = response[0]?.entrylogs;
        this.pairCheckInCheckOutLogs();
        const today = new Date();
        const startOfMonthDate = startOfMonth(today);
        const daysInMonth = eachDayOfInterval({
          start: startOfMonthDate,
          end: today,
        });
        this.events = daysInMonth.map((day) => {
          const record = response.find((r) => isSameDay(new Date(r.checkin), day));
          const checkinDate = record ? new Date(record.checkin) : null;
          const checkoutDate = record && record.checkout ? new Date(record.checkout) : null;

          const eventTitle = `
            Check-in: ${checkinDate ? checkinDate.toLocaleTimeString() : 'N/A'}<br>
            Check-out: ${checkoutDate ? checkoutDate.toLocaleTimeString() : 'N/A'}<br>
          `;

          return {
            start: startOfDay(day),
            end: endOfDay(day),
            title: eventTitle,
            draggable: true,
            resizable: { beforeStart: true, afterEnd: true },
            meta: {
              checkin: checkinDate,
              checkout: checkoutDate,
            },
          };
        });
        this.refresh.next();
      })
      .catch(error => {
        console.error('Error fetching attendance data', error);
      });
  }

  pairCheckInCheckOutLogs() {
    let checkInTime = null;
    this.pairedLogs = [];
    let sessionIndex = 0;
    for (let i = 0; i < this.entryLogs?.length; i++) {
      const log = this.entryLogs[i];

      if (log.action === 'checkIn') {
        checkInTime = log.time;
      } else if (log.action === 'checkOut' && checkInTime) {
        const duration = this.calculateDuration(checkInTime, log.time);

        this.pairedLogs.push({
          checkIn: new Date(checkInTime),
          checkOut: new Date(log.time),
          duration: duration,
        });

        sessionIndex++;
        checkInTime = null;
      }
    }
    this.modalService.open(this.modalShow);
  }


  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }


  handleCurrentDay(records) {
    let day = new Date().getDate();
    let month = (new Date().getMonth() + 1);
    let year = new Date().getFullYear();

    let today = records.find(a => a.day == day && a.month == month && a.year == year);
    var existingLogsMin = today.totalWorkHours;
    var lastLog = today.entrylogs[(today.entrylogs.length - 1)];

    if (today && lastLog) {
      this.hasCheckedIn = lastLog.action == "checkIn";
      if (lastLog.action == "checkIn") {
        var startDate = new Date(lastLog.time);
        var endDate = new Date();
        var timeFromLastCheckIn = (endDate.getTime() - startDate.getTime()) / 1000;
        this.counterInSeconds = ((parseFloat(existingLogsMin) * 60) + timeFromLastCheckIn);
        this.startCounter();

        // Capture the first check-in time if it's the first check-in of the day
        if (!this.firstCheckInTime) {
          this.firstCheckInTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          // Save the first check-in time to localStorage
          localStorage.setItem('firstCheckInTime', this.firstCheckInTime);
        }
      } else {
        this.counterInSeconds = ((parseFloat(existingLogsMin) * 60));
        this.convertSecondsToTimeLabel();
      }
    } else {
      this.counterInSeconds = 0;
    }
  }

  checkIn() {
    this.hasCheckedIn = true;
    localStorage.setItem('hasCheckedIn', 'true');
    const currentDateTime = new Date();
    const checkInData = {
      action: 'checkIn',  // Add action as checkIn
      checkin: currentDateTime.toISOString(),
      day: currentDateTime.getDate(),
      month: currentDateTime.getMonth() + 1,
      year: currentDateTime.getFullYear(),
      employeeId: this.employeeId,  // Check employeeId is correctly set
    };

    Swal.fire({
      title: 'Are you sure you want to check in?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Check In!',
      cancelButtonText: 'No, Cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        (await this.attendanceService.checkIn(checkInData)).subscribe({
          next: (response) => {
            this.checkINDATA = response;
            this.hasCheckedOut = false;
            this.counterInSeconds = this.checkINDATA?.totalWorkHours * 60;  // Get total seconds
            this.startCounter();

            // Set first check-in time if it's the first check-in of the day
            if (!this.firstCheckInTime) {
              this.firstCheckInTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              // Save the first check-in time to localStorage
              localStorage.setItem('firstCheckInTime', this.firstCheckInTime);
            }
          },
          error: (error) => {
            console.error('Error during check-in', error);
            Swal.fire('Error', 'There was an issue during check-in. Please try again.', 'error');
          },
        });
      }
    });
  }

  checkOut() {
    this.hasCheckedOut = true;
    localStorage.setItem('hasCheckedOut', 'true');
    const currentDateTime = new Date();
    const checkOutData = {
      action: 'checkOut',  // Add action as checkOut
      checkout: currentDateTime.toISOString(),
      day: currentDateTime.getDate(),
      month: currentDateTime.getMonth() + 1,
      year: currentDateTime.getFullYear(),
    };

    Swal.fire({
      title: 'Are you sure you want to check out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Check Out!',
      cancelButtonText: 'No, Cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        (await this.attendanceService.checkOut(checkOutData)).subscribe({
          next: (response) => {
            this.stopCounter();
            this.hasCheckedIn = false;
          },
          error: (error) => {
            console.error('Error during check-out', error);
          },
        });
      }
    });
  }




  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }


  async getLeaveData(year: any, month: any) {
    (await this.leaveService.getLeaveDataAttendance(year, month)).subscribe((res) => {

    });
  }
  async getEmployee() {
    (await this.employeeService.getEmployeeList()).subscribe((res) => {
      if (res && res.data) {

      }
    });
  }

  openDayEndModal(id: string, content: any): void {
    this.selectedAttendanceId = id; // Set the poll ID before opening the modal
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }
}
