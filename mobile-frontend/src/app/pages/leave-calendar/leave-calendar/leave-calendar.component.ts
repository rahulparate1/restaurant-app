
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Calendar, CalendarOptions, EventApi } from '@fullcalendar/core';
import { category, calendarEvents } from '../data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveCalendarService } from '../leave-calendar.service';
import { ApiService } from 'src/app/core/services/api.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { from } from 'rxjs';
@Component({
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.css']
})
export class LeaveCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarElement: any;
  calendar: Calendar;
  breadCrumbItems: Array<{}>;
  @ViewChild('modalShow') modalShow: TemplateRef<any>;
  @ViewChild('editmodalShow') editmodalShow: TemplateRef<any>;

  formEditData: UntypedFormGroup;
  submitted = false;
  holidayDataByDate: { [date: string]: any[] } = {};
  category: any[] = [];
  leaveData: any[] = [];
  holidayData: any[] = [];
  newEventDate: any;
  holidayEvents: any[] = [];
  calendarEvents: any[] = [];
  editEvent: any;
  title: string;
  startDate: string;
  endDate: string;
  userId: string;
  employeeName: string;
  additionalDetails?: string;
  year: any;
  month: any;
  formData: UntypedFormGroup;
  leaveDataByDate: { [key: string]: any[] } = {};
  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear',
    },
    initialView: 'dayGridMonth',
    themeSystem: 'bootstrap',
    initialEvents: this.mapHolidayDataToCalendarEvents(this.holidayData),
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.onDateClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: true,
    },
    eventStartEditable: false,
    eventDurationEditable: false,
  };

  ngAfterViewInit() {
    this.initializeCalendar();
  }

  initializeCalendar() {
    if (this.calendarElement) {
      this.calendar = new Calendar(this.calendarElement.nativeElement, this.calendarOptions);
      this.calendar.render();
      this.calendar.refetchEvents();
    }
  }

  updateCalendarEvents(holidayData: any[]) {
    const mappedEvents = this.mapHolidayDataToCalendarEvents(holidayData);
    this.calendar.addEventSource(mappedEvents);
  }

  mapHolidayDataToCalendarEvents(holidayData: any[]) {
    return holidayData.map((holiday) => ({
      id: holiday.id,
      title: holiday.title || 'Holiday',
      start: holiday.startDate,
      end: holiday.endDate,
      backgroundColor: '#ff6347',
      borderColor: '#ff6347',
      textColor: 'white',
    }));
  }

  currentEvents: EventApi[] = [];
  leaveTypeData: any[] = [];
  calenderData: any;

  constructor(
    private modalService: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private service: LeaveCalendarService,
    private apiService: ApiService
  ) { }


  ngOnInit(): void {

    this.breadCrumbItems = [{ label: 'Calendar' }, { label: 'Leave Calendar', active: true }];
    this.year = this.getCurrentYear().toString();
    this.month = this.getCurrentMonth().toString();
    this.getHolidayList(this.year, this.month);
    this.formData = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });

    this.formEditData = this.formBuilder.group({
      editTitle: ['', [Validators.required]],
      editCategory: [],
    });

    this._fetchData();

    this.getLeaveData(this.year, this.month);

  }

  async getLeaveTypes() {
    return new Promise(async (resolve, reject) => {
      (await this.service.getLeaveTypes()).subscribe(
        (res) => {
          this.leaveTypeData = res;
          const leaveTypes = {};
          this.leaveTypeData.forEach((leaveType) => {
            leaveTypes[leaveType.id] = leaveType.name;
          });

          console.log('leaveTypes Mapping:', leaveTypes);
          resolve(leaveTypes);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getLeaveData(year: number, month: number) {
    const leaveTypes = await this.getLeaveTypes();

    (await this.service.getLeaveData1(year, month)).subscribe((res) => {
      this.leaveData = res;
      this.leaveDataByDate = {};
      this.leaveData.forEach((leave) => {
        const leaveStartDate = new Date(leave.startDate).toISOString().split('T')[0];
        const leaveEndDate = new Date(leave.endDate).toISOString().split('T')[0];

        let currentDate = new Date(leaveStartDate);
        while (currentDate <= new Date(leaveEndDate)) {
          const dateKey = currentDate.toISOString().split('T')[0];

          if (!this.leaveDataByDate[dateKey]) {
            this.leaveDataByDate[dateKey] = [];
          }

          const employeeName = leave.employee?.basicDetails?.firstName || 'Employee';
          const leaveTypeId = leave.type;
          const leaveTypeName = leaveTypes[leaveTypeId] || 'Unknown Leave Type';
          this.leaveDataByDate[dateKey].push({
            leaveText: leaveTypeName,
            leaveType: leaveTypeId,
            employeeName: employeeName,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      const leaveEvents = this.leaveData.map((leave) => {
        const leaveTypeId = leave.type;
        const leaveTypeText = leaveTypes[leaveTypeId] || 'Unknown Leave Type';
        const leaveTypeClass = leaveTypeId;
        const eventColor = this.getLeaveTypeColor(leaveTypeId);
        const firstName = leave.employee?.basicDetails?.firstName || '';
        const lastName = leave.employee?.basicDetails?.lastName || '';
        const employeeName = `${firstName} ${lastName}`.trim() || 'Employee';
        const eventTitle = `${employeeName} - ${leaveTypeText}`;

        return {
          id: leave.id,
          title: eventTitle,
          type: leaveTypeId,
          start: leave.startDate.split('T')[0],
          end: leave.endDate.split('T')[0],
          classNames: [leaveTypeClass],
          extendedProps: {
            leaveType: leaveTypeClass,
            userId: leave.userId,
            employee: employeeName,
            duration: leave.duration,
            approvals: leave.approvals,
            comment: leave.comment || '',
            additionalDetails: leave.additionalDetails || '',
          },
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: 'white',
        };
      });

      this.calendarEvents = [...leaveEvents, ...this.calendarEvents];
      this.calendarOptions.events = this.calendarEvents;
      this.calendar.refetchEvents();
    });
  }



  async getHolidayList(year: number, month: number) {
    (await this.service.getHoliday(year, month)).subscribe((res) => {
      if (!res || res.length === 0) {
        return;
      }

      console.log('Fetched holidayData:', res);
      this.holidayDataByDate = {};
      res.forEach((holiday) => {
        const holidayStartDate = new Date(holiday.startDate).toISOString().split('T')[0];
        const holidayEndDate = new Date(holiday.endDate).toISOString().split('T')[0];

        let currentDate = new Date(holidayStartDate);
        while (currentDate <= new Date(holidayEndDate)) {
          const dateKey = currentDate.toISOString().split('T')[0];
          if (!this.holidayDataByDate[dateKey]) {
            this.holidayDataByDate[dateKey] = [];
          }
          this.holidayDataByDate[dateKey].push({
            holidayText: holiday.title || 'Holiday',
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      const holidayEvents = res.map((holiday) => {
        const holidayTypeClass = 'holiday';
        const eventColor = '#ff6347';
        return {
          id: holiday.id,
          title: holiday.title || 'Holiday',
          start: holiday.startDate.split('T')[0],
          end: holiday.endDate.split('T')[0],
          classNames: [holidayTypeClass],
          extendedProps: {
            holidayText: holiday.title || 'Holiday',
          },
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: 'white',
        };
      });

      this.calendarEvents = [...holidayEvents, ...this.calendarEvents];
      this.calendarOptions.events = this.calendarEvents;
    }, (error) => {
      console.error('Error fetching holiday data:', error);
    });
  }



  updateCalendar() {
    console.log("Updating calendar...");

  }

  getLeaveTypeColor(leaveType: string) {
    switch (leaveType) {
      case 'sick':
        return '#ff6347';
      case 'casual':
        return '#f39c12';
      default:
        return '#3498db';
    }
  }

  // Get current year
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Get current month
  getCurrentMonth(): number {
    return new Date().getMonth() + 1;
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  onDateClick(dateInfo: any) {
    const clickedDate = dateInfo.dateStr;

    this.clearLeaveTypes();
    const leaveForDate = this.leaveDataByDate[clickedDate] || [];
    leaveForDate.forEach((leave) => {
      const leaveTypeClass = leave.leaveType;
      const leaveTypeText = leave.leaveText;
      this.addLeaveTypeToDate(dateInfo.date, leaveTypeClass, leaveTypeText);
    });
  }

  addLeaveTypeToDate(date: Date, leaveTypeClass: string, leaveTypeText: string) {
    const dateCell = document.querySelector(`td[data-date="${date.toISOString().split('T')[0]}"]`);
    if (dateCell) {
      const leaveTypeDiv = document.createElement('div');
      leaveTypeDiv.classList.add(leaveTypeClass);
      leaveTypeDiv.innerText = leaveTypeText;
      leaveTypeDiv.classList.add('leave-type-label');
      dateCell.appendChild(leaveTypeDiv);
    }
  }


  clearLeaveTypes() {
    const leaveTypeLabels = document.querySelectorAll('.leave-type-label');
    leaveTypeLabels.forEach(label => label.remove());
  }


  private _fetchData() {
    this.category = category;
    this.calendarEvents = calendarEvents;
    this.submitted = false;
  }

}
