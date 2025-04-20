import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { reasonList, statusList } from '../exit-data';
import { ExitProcessService } from '../exit-process.service';
import { rolesType } from 'src/app/layouts/full/shared/constant';
import { ApiService } from "src/app/services/api.service";
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
  selector: 'app-exit-process-list',
  templateUrl: './exit-process-list.component.html',
  styleUrls: ['./exit-process-list.component.css']
})


export class ExitProcessListComponent {
  breadCrumbItems: Array<{}>;
  latestResignation: any = null; // Latest resignation
  filterBy = "";
  shiftListData: any[] = [];
  originalShiftListData: any[] = [];
  displayedShifts: any[] = [];
  shiftListDetails: any;
  selectedDepartment: string = '';
  years: number[] = [];
  months: { month: string; name: string; disabled: boolean }[] = [];
  selectedYear: number | null = null;
  selectedMonthYear: string = "";
  today: Date = new Date();
  selectedDate: string = "";
  minMonthYear: string = "2010-01";
  // Pagination properties
  loadingTrans: boolean = false;
  employeeData: any;
  selectedEmployeeName: string = '';  
  selectedEmployees: string[] = ['all'];
  filterByName: string = 'all';
  // filterByName: string | null = null; 
  designationRole: { key: string; value: string }[];
  statusList: any = statusList;
  reasonList: any = reasonList;
  designation: any;
  user: any;
  pageNumber: number = 1;
  totalRecord: number = 0;
  totalPages: number = 0;
  offset: number = 0;
  limit: number = 10; 
  currentPage: number = 1;
  pageSize: any;
  pageNo: any;
  exitprocess: any[] = [];
  dataSource: any;
  data: any;
  searchTerm: string = '';
  showNoDataFoundMessage: boolean = false;
  isResignationButtonDisabled: boolean = false; // Flag to manage button disabled state
  exitprocesslist: any;
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  constructor(
    public router: Router,
    private service: ExitProcessService,
    private employeeService: EmployeeManagementService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Exit Process" },
      { label: "List", active: true },
    ];
    this.designationRole = rolesType;
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.user?.roles[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;
    this.getEmployee();
    this.generateYears();
    this.getExitData();
    this.exitprocesslist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.latestResignation = this.exitprocesslist.length > 0 ? this.exitprocesslist[0] : null;
  }

  getStausLabel(id) {
    return this.statusList.find((x) => x.id == id)?.label;
  }

  getReasonLabel(id) {
    return this.reasonList.find((x) => x.id == id)?.label;
  }

 
  async getExitData() {
    this.apiService.startLoader();
    let search: any = {};

    if (this.filterByName !== 'all' && this.filterByName !== '') {
      search.employeeId = this.filterByName;
    }

    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-");
      search.year = year;
      search.month = month;
    }

    (await this.service.getResignationFilter(this.offset, this.limit, search)).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.exitprocesslist = res.data;
          this.totalRecord = res.totalRecord;
          this.showNoDataFoundMessage = this.exitprocesslist.length === 0;
          this.getPageNumbers();

          // Sorting by date and time (descending order)
          this.exitprocesslist.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.time || '00:00'));  
            const dateB = new Date(b.date + 'T' + (b.time || '00:00'));  
            return dateB.getTime() - dateA.getTime();  
          });

          // Set latest resignation
          this.latestResignation = this.exitprocesslist.length > 0 ? this.exitprocesslist[0] : null;

          // Update the disabled state based on the latest resignation's status
          this.isResignationButtonDisabled = this.latestResignation && 
            (this.latestResignation.status === '3' || this.latestResignation.status === '1');
        } else {
          this.showNoDataFoundMessage = true;
        }
        this.apiService.stopLoader();
      },
      error: (error) => {
        console.error('Error retrieving exit process data:', error);
        this.showNoDataFoundMessage = true;
        this.apiService.stopLoader();
      }
    });
  }

  // async getExitData() {
  //   this.apiService.startLoader();
  //   let search: any = {};
  
  //   if (this.filterByName !== 'all' && this.filterByName !== '') {
  //     search.employeeId = this.filterByName;
  //   }
  
  //   if (this.selectedMonthYear) {
  //     const [year, month] = this.selectedMonthYear.split("-");
  //     search.year = year;
  //     search.month = month;
  //   }
  
  //   (await this.service.getResignationFilter(this.offset, this.limit, search)).subscribe({
  //     next: (res: any) => {
  //       if (res && res.data) {
  //         this.exitprocesslist = res.data;
  //         this.totalRecord = res.totalRecord;
  //         this.showNoDataFoundMessage = this.exitprocesslist.length === 0;
  //         this.getPageNumbers();
  
  //         // Sorting by date and time (descending order)
  //         this.exitprocesslist.sort((a, b) => {
  //           const dateA = new Date(a.date + 'T' + (a.time || '00:00'));  
  //           const dateB = new Date(b.date + 'T' + (b.time || '00:00'));  
  //           return dateB.getTime() - dateA.getTime();  
  //         });
  
  //         this.latestResignation = this.exitprocesslist.length > 0 ? this.exitprocesslist[0] : null;
  //       } else {
  //         this.showNoDataFoundMessage = true;
  //       }
  //       this.apiService.stopLoader();
  //     },
  //     error: (error) => {
  //       console.error('Error retrieving exit process data:', error);
  //       this.showNoDataFoundMessage = true;
  //       this.apiService.stopLoader(); 
  //     }
  //   });
  // }
  


async getEmployee() {
  (await this.employeeService.getEmployeeList()).subscribe((res) => {
    if (res && res.data) {
      // Sort the employee data by first name in ascending order
      this.employeeData = res.data.sort((a, b) => {
        const nameA = a.basicDetails.firstName.toLowerCase(); // Convert to lowercase to make it case-insensitive
        const nameB = b.basicDetails.firstName.toLowerCase(); // Convert to lowercase to make it case-insensitive
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

onMonthYearChange(event: Event) {
  const target = event.target as HTMLInputElement;
  this.selectedMonthYear = target.value; // 'YYYY-MM' format
  this.offset = 0; // Reset offset for new search
  this.getExitData();
}

  onEmployeeSelect() {
    const selectedEmployee = this.employeeData.find(emp => emp.id === this.filterByName);
    if (selectedEmployee) {
      this.filterByName = selectedEmployee.id;
      this.selectedEmployeeName = `${selectedEmployee.basicDetails.firstName} ${selectedEmployee.basicDetails.lastName}`;
    }
    this.getExitData(); 
  }
  

  filterBySelectedEmployees(selectedEmails: string[]) {
    this.selectedEmployees = selectedEmails;
    this.filter();
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear; i++) {
      this.years.push(i);
    }
  }
  
  filter() {
    this.getExitData();
    this.showNoDataFoundMessage = this.dataSource?.filteredData.length === 0;
    this.resetToPageOne();
  }

  titleExitProcess(id) {
    this.router.navigate(['/exit-process/details/' + id]);
  }

  navigateToExitProcess() {
    this.router.navigate(['exit-process/form']);
  }

  getStatusLabel(statusId: any): string {
    const status = this.statusList.find((s) => s.id.toString() === statusId.toString());
    return status ? status.label : "N/A";
  }


  getStatusClass(statusId: any): string {
    const status = this.statusList.find((s) => s.id.toString() === statusId.toString());
    return status ? status.className : '';
  }
  resetFilter(filter: string) {
    switch (filter) {
      case 'employee':
        this.selectedEmployeeName = ''; 
        this.filterByName = 'all'; 
        break;
      case 'monthYear':
        this.selectedMonthYear = ''; 
        this.getExitData(); 
  
        break;
    }
  
    this.resetToPageOne(); 
       this.getExitData();
  }
  
  reset() {
    this.filterByName = "all";
    this.selectedMonthYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    this.resetToPageOne();
    this.getExitData();
  }

  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 10;
    this.currentPage = 1;
  }

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1;
    this.offset = (this.currentPage - 1) * this.limit;
    this.getExitData();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getExitData();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRecord / this.limit);
    const currentPage = Math.ceil((this.offset + 1) / this.limit);
    const maxPagesToShow = 10;

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
    this.getExitData();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecord) {
      this.offset += this.limit;
      this.currentPage++;
      this.getExitData();
    }
  }


  

}
