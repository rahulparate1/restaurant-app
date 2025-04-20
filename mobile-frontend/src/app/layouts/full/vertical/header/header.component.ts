import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/app.config';
import { CustomizerComponent } from '../../shared/customizer/customizer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FullComponent } from '../../full.component';
import { MatSidenav } from '@angular/material/sidenav';
import Swal from 'sweetalert2';
import { HeaderService } from './header.service';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from 'src/app/pages/employee/employee.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-secondary ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

export interface NotificationsListElement {
  description: string;
  date: any;
  title: string;
}

interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    CustomizerComponent,
    SidebarComponent,
    FullComponent,
  ],
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  options = this.settings.getOptions();
  @ViewChild('customizerRight') customizerRight: MatSidenav;
  user: any;
  showFiller = false;
  id: string;
  employeeData: any;

  pageSize: any;
  pageNo: any;
  search: any;
  employeeDataList: any[];

  private htmlElement!: HTMLHtmlElement;
  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  ngOnInit(): void {
    this.getEmployeeList();
  }

  goToDetails(id) {
    this.router.navigate(['/employee/employee-details/' + id]);
  }

  async getEmployeeList() {
    (await this.employeeService.getEmployeeList()).subscribe(
      (res: any) => {
        if (res) {
          this.employeeData = res.data[0];
        }
      },
      (error) => {
        console.error('Error retrieving employee data:', error);
      }
    );
  }

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];
  notificationData: any[];
  dataSource: any;

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    public router: Router,
    private settings: CoreService,
    private service: HeaderService,
    private employeeService: EmployeeService,
    private activeRoute: ActivatedRoute
  ) {
    translate.setDefaultLang('en');
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.getNotificationList();
  }

  async getNotificationList() {
    (await this.service.getNotification()).subscribe((res: any[]) => {
      this.notificationData = res;
      this.dataSource = new MatTableDataSource<NotificationsListElement>(
        this.notificationData
      );
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/',
    },
  ];

  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'eCommerce App',
      subtitle: 'Buy a Product',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Courses',
      subtitle: 'Create new course',
      link: '/',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/t',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/',
    },
  ];

  toggleCustomizer() {
    if (this.customizerRight.opened) {
      this.customizerRight.close();
    } else {
      this.customizerRight.open();
    }
  }

  logout() {
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        icon: 'warning',
        confirmButtonText: 'Yes, Logout!',
        cancelButtonText: 'No',
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          localStorage.clear();
          this.router.navigate(['/authentication/side-login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }

  changePass() {
    this.router.navigate(['/authentication/change-password']);
  }
}

@Component({
  selector: 'search-dialog',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    CustomizerComponent,
    FullComponent,
    NgForOf,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);
}
