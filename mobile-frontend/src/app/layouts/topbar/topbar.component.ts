import { Component, OnInit, Output, EventEmitter, Inject, ViewChild, TemplateRef } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { AuthenticationService } from "../../core/services/auth.service";
import { AuthfakeauthenticationService } from "../../core/services/authfake.service";
import { environment } from "../../../environments/environment";
import { CookieService } from "ngx-cookie-service";
import { LanguageService } from "../../core/services/language.service";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { Observable, map } from "rxjs";
import { changesLayout } from "src/app/store/layouts/layout.actions";
import { getLayoutMode } from "src/app/store/layouts/layout.selector";
import { RootReducerState } from "src/app/store";
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import firebase from 'firebase/compat/app';
import { ApiService } from "src/app/services/api.service";
import { ToastrService } from "ngx-toastr";
import { NotificationsService } from "src/app/pages/notifications/notifications.service";
import { AttendanceService } from "../../pages/attendance/attendance.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {
  user: any;
  currentUserId: string | null = null;
  currentUserRole: string | null = null;
  mode: any;
  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  theme: any;
  layout: string;
  dataLayout$: Observable<string>;
  userDetails: any;
  isAdmin = true;
  profileData: any;
  notificationData: any[] = [];
  showBadge = true;
  // Define layoutMode as a property
  userWorkLocation: string | null = null;
  userDepartment: string | null = null;
  @ViewChild('timesheetDetailsModal') timesheetDetailsModal!: TemplateRef<any>;
timesheetDetails: any;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    public languageService: LanguageService,
    public translate: TranslateService,
    public _cookiesService: CookieService,
    public store: Store<RootReducerState>,
    private afMessaging: AngularFireMessaging,
    private apiService: ApiService,
    private notificationService: NotificationsService,
    private toastr: ToastrService,
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
  ) {}

  listLang: any = [
    { text: "English", flag: "assets/images/flags/us.jpg", lang: "en" },
    { text: "Spanish", flag: "assets/images/flags/spain.jpg", lang: "es" },
    { text: "German", flag: "assets/images/flags/germany.jpg", lang: "de" },
    { text: "Italian", flag: "assets/images/flags/italy.jpg", lang: "it" },
    { text: "Russian", flag: "assets/images/flags/russia.jpg", lang: "ru" },
  ];

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    this.getNotificationList();
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    const basicDetails = this.user?.employee?.basicDetails || {};
    this.currentUserId = this.user?.user?.id || null; // ✅ Get current user ID from localStorage
    this.currentUserRole = this.user?.user?.roles?.[0] || null;console.log("this.currentUserRole==>", this.currentUserRole)
  // this.userWorkLocationId = basicDetails?.workLocation?.id || null;
  // this.userDepartmentId = basicDetails?.department?.id || null;
  this.userWorkLocation = basicDetails?.workLocation?.name || null;
  this.userDepartment = basicDetails?.department?.name || null;
    // this.initialAppState = initial      State;
    this.store.select("layout").subscribe((data) => {
      this.theme = data.DATA_LAYOUT;
    });
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.cookieValue = this._cookiesService.get("lang");
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.valueset = "assets/images/flags/us.jpg";
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }
    this.profileData = JSON.parse(localStorage.getItem("payoutUser"));
    this.requestPermission();
    this.listenForMessages();
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    localStorage.clear();
    this.router.navigate(["/auth/login-2"]);
  }

  goToAI() {
    this.router.navigate(["/ai"]);
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle("fullscreen-enable");
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  changeLayout(layoutMode: string) {
    this.theme = layoutMode;
    this.store.dispatch(changesLayout({ layoutMode }));
    this.store.select(getLayoutMode).subscribe((layout) => {
      document.documentElement.setAttribute("data-layout", layout);
    });
  }

  getFromLocalStorage() {
    this.userDetails = JSON.parse(localStorage.getItem("user"));

    if (this.userDetails.designation == "admin") {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  changePassword(){
    this.router.navigate(['/employee/password']);
  }
  async requestPermission() {
    this.afMessaging.requestToken.subscribe({
      next: async (token) => {
        if (!token) {
          console.warn('⚠️ FCM token is null. This may happen in incognito mode or if permission is blocked.');
          return;
        }

        console.log('✅ FCM Token:', token);
        localStorage.setItem('fcmToken', token); // Optionally store for later use

        try {
          const res$ = await this.apiService.commonGet('/users/set-push-token/' + token);
          res$.subscribe({
            next: (res) => {
              console.log('✅ Push token registered to backend:', res);
            },
            error: (err) => {
              console.error('❌ Failed to register push token:', err);
            },
          });
        } catch (err) {
          console.error('❌ Error while calling API:', err);
        }
      },
      error: (err) => {
        console.error('❌ Unable to get permission for notifications:', err);
        if (Notification.permission === 'denied') {
          console.warn('🚫 Notification permission is denied by user or browser.');
        }
      },
    });
  }

  // async requestPermission() {
  //   this.afMessaging.requestToken.subscribe({
  //     next: async (token) => {
  //       console.log('✅ FCM Token:', token);
  //       // Send token to backend
  //       (await this.apiService
  //         .commonGet('/users/set-push-token/' + token))
  //         .subscribe({
  //           next: (res) => {
  //             console.log('✅ Push token registered to backend:', res);
  //           },
  //           error: (err) => {
  //             console.error('❌ Failed to register push token:', err);
  //           },
  //         });
  //     },
  //     error: (err) => {
  //       console.error('❌ Unable to get permission for notifications', err);
  //     },
  //   });
  // }
  // working code but only for notice module details
  // listenForMessages() {
  //   this.afMessaging.messages.subscribe((payload: any) => {
  //     console.log('📩 New message received:', payload);

  //     const title = payload?.notification?.title || 'New Notification';
  //     const body = payload?.notification?.body || '';
  //     const data = payload?.data || {};
  //     const noticeId = data.noticeId;

  //     // Modified body to include a click hint using HTML
  //     const formattedBody = `
  //       <div>
  //         ${body}
  //         <br />
  //         <small><em>Click to view details</em></small>
  //       </div>
  //     `;

  //     // Show interactive toast with HTML
  //     const toast = this.toastr.info(formattedBody, title, {
  //       enableHtml: true,
  //       disableTimeOut: true,
  //       tapToDismiss: false,
  //       closeButton: true,
  //       positionClass: 'toast-top-right'
  //     });

  //     // On toast click, navigate to the notice detail page
  //     toast.onTap.subscribe(() => {
  //       if (noticeId) {
  //         this.router.navigate(['/notice/notice-details', noticeId]).catch(err => {
  //           console.error('Navigation error:', err);
  //         });
  //       }
  //     });
  //   });
  // }

  // listenForMessages() {
  //   this.afMessaging.messages.subscribe((payload: any) => {
  //     console.log('New message received:', payload);

  //     const title = payload?.notification?.title || 'New Notification';
  //     const body = payload?.notification?.body || '';
  //     const data = payload?.data || {};
  //     const module = data?.module;

  //     // IDs based on module
  //     const noticeId = data?.noticeId;
  //     const reimbursementId = data?.reimbursementId;
  //     const leaveId = data?.leaveId;
  //     const eventId = data?.eventId;
  //     const newsFeedId = data?.newsFeedId;
  //     const pollId = data?.pollId;
  //     const timesheetId = data?.timesheetId;
  //     const workLocation = data?.workLocation;
  //     const department = data?.department;

  //     if (module === 'notice') {
  //       const creatorRole = data?.creatorRole;
  //       const creatorId = data?.creatorId;

  //       const privilegedRoles = ['super-admin', 'admin', 'HR', 'accountant'];
  //       const isPrivilegedUser = privilegedRoles.includes(creatorRole);
  //       const isPrivilegedViewingOwnNotice = isPrivilegedUser && creatorId === this.currentUserId;

  //       const isWorkLocationMatch = !workLocation || workLocation === this.userWorkLocation;
  //       const isDepartmentMatch = !department || department === this.userDepartment;

  //       if (!isWorkLocationMatch && !isDepartmentMatch && !isPrivilegedViewingOwnNotice) {
  //         console.log('User not eligible for this notice');
  //         return; // Don't show notification
  //       }
  //     }

  //     // ✅ Timesheet access check
  //   if (module === 'timesheet') {
  //     const creatorId = data?.creatorId;
  //     const creatorRole = data?.creatorRole;

  //     const isCreator = creatorId === this.currentUserId;
  //     const isAdminOrHR = ['admin', 'HR'].includes(this.currentUserRole);

  //     if (!isCreator && !isAdminOrHR) {
  //       console.log('User not eligible for this timesheet notification');
  //       return; // Skip notification
  //     }
  //   }
  //     const formattedBody = `
  //       <div>
  //         ${body}
  //         <br />
  //         <small><em>Click to view details</em></small>
  //       </div>
  //     `;

  //     const toast = this.toastr.info(formattedBody, title, {
  //       enableHtml: true,
  //       disableTimeOut: true,
  //       tapToDismiss: false,
  //       closeButton: true,
  //       positionClass: 'toast-top-right'
  //     });

  //     toast.onTap.subscribe(() => {
  //       switch (module) {
  //         case 'notice':
  //           if (noticeId) {
  //             this.router.navigate(['/notice/notice-details', noticeId]).catch(err => {
  //               console.error('Navigation error (notice):', err);
  //             });
  //           }
  //           break;
  //           case 'events':
  //           if (eventId) {
  //             this.router.navigate(['/event/event-details', eventId]).catch(err => {
  //               console.error('Navigation error (events):', err);
  //             });
  //           }
  //           break;
  //           case 'newsfeed':
  //           if (newsFeedId) {
  //             this.router.navigate(['/newsfeed/details', newsFeedId]).catch(err => {
  //               console.error('Navigation error (newsfeed):', err);
  //             });
  //           }
  //           break;
  //           case 'polls':
  //           if (pollId) {
  //             this.router.navigate(['/polls/poll-details', pollId]).catch(err => {
  //               console.error('Navigation error (polls):', err);
  //             });
  //           }
  //           break;
  //         case 'reimbursement':
  //           if (reimbursementId) {
  //             this.router.navigate(['/reimbursement/details', reimbursementId]).catch(err => {
  //               console.error('Navigation error (reimbursement):', err);
  //             });
  //           }
  //           break;
  //         case 'leave':
  //           if (leaveId) {
  //             this.router.navigate(['/leave-management/leave-details', leaveId]).catch(err => {
  //               console.error('Navigation error (leave):', err);
  //             });
  //           }
  //           break;
  //         case 'timesheet':
  //           if (timesheetId) {
  //             this.router.navigate(['/timesheet/view', timesheetId]).catch(err => {
  //               console.error('Navigation error (timesheet):', err);
  //             });
  //           }
  //           break;
  //         default:
  //           console.warn('Unknown module in notification:', module);
  //           break;
  //       }
  //     });
  //   });
  // }

  listenForMessages() {
    this.afMessaging.messages.subscribe((payload: any) => {
      console.log('New message received:', payload);

      const title = payload?.notification?.title || 'New Notification';
      const body = payload?.notification?.body || '';
      const data = payload?.data || {};
      const module = data?.module;

      const noticeId = data?.noticeId;
      const reimbursementId = data?.reimbursementId;
      const leaveId = data?.leaveId;
      const eventsId = data?.eventsId;
      const newsFeedId = data?.newsfeedId;
      const pollId = data?.pollId;
      const timesheetId = data?.timesheetId;
      const workLocation = data?.workLocation;
      const department = data?.department;

      // ✅ Adjust based on your stored user details
      const userRoles = this.user?.user?.roles || [];
      const userWorkLocationId = this.user?.employee?.basicDetails?.workLocation?.id;
      const userDepartmentId = this.user?.employee?.basicDetails?.department?.id;
      const currentUserId = this.user?.id;

      if (module === 'notice') {
        const privilegedRoles = ['super-admin', 'admin', 'HR', 'accountant'];
        const isPrivilegedUser = userRoles.some(role => privilegedRoles.includes(role));

        const isWorkLocationMatch = !workLocation || workLocation === userWorkLocationId;
        const isDepartmentMatch = !department || department === userDepartmentId;

        if (!isPrivilegedUser && (!isWorkLocationMatch || !isDepartmentMatch)) {
          console.log('User not eligible for this notice');
          return;
        }
      }
      const formattedBody = `
        <div>
          ${body}
          <br />
          <small><em>Click to view details</em></small>
        </div>
      `;

      const toast = this.toastr.info(formattedBody, title, {
        enableHtml: true,
        disableTimeOut: true,
        tapToDismiss: false,
        closeButton: true,
        positionClass: 'toast-top-right'
      });

      toast.onTap.subscribe(() => {
        switch (module) {
          case 'notice':
            if (noticeId) this.router.navigate(['/notice/notice-details', noticeId]);
            break;
          case 'events':
            if (eventsId) this.router.navigate(['/event/event-details', eventsId]);
            break;
          case 'newsfeed':
            if (newsFeedId) this.router.navigate(['/newsfeed/details', newsFeedId]);
            break;
          case 'polls':
            if (pollId) this.router.navigate(['/polls/poll-details', pollId]);
            break;
          case 'reimbursement':
            if (reimbursementId) this.router.navigate(['/reimbursement/details', reimbursementId]);
            break;
          case 'leave':
            if (leaveId) this.router.navigate(['/leave-management/leave-details', leaveId]);
            break;
            case 'timesheet':
  if (timesheetId) this.openModalForTimesheet(timesheetId);
  break;
          // case 'timesheet':
          //   if (timesheetId) this.router.navigate(['/timesheet/view', timesheetId]);
          //   break;
          default:
            console.warn('Unknown module in notification:', module);
        }
      });
    });
  }

  goToNotification(){
    // this.showBadge = false;
    this.router.navigate(["/notifications"]);
  }


  async getNotificationList() {
    (await this.notificationService.getNotification()).subscribe(
      (res) => {
        this.notificationData = res;
        console.log("this.notificationData==>", this.notificationData)
        this.notificationData = this.notificationData.filter(x => x.status != 'read' );
      }
    );
  }

 async openModalForTimesheet(timesheetId: string) {
    (await this.attendanceService.getTimesheetbyId(timesheetId)).subscribe({
      next: (res) => {
        this.timesheetDetails = res;
        this.modalService.open(this.timesheetDetailsModal, { centered: true });
      },
      error: (err) => {
        console.error('Error fetching timesheet details:', err);
        this.toastr.error('Failed to load timesheet details.');
      }
    });
  }
}
