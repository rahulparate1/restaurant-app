import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { AttendanceService } from "../attendance.service";
import { BehaviorSubject, Observable } from 'rxjs';
import { requestStatusList } from 'src/app/layouts/full/shared/constant';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-attendance-request-list',
  templateUrl: './attendance-request-list.component.html',
  styleUrls: ['./attendance-request-list.component.css']
})
export class AttendanceRequestListComponent {
  refresh: BehaviorSubject<any> = new BehaviorSubject(undefined);
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  RequestData?: any;
  breadCrumbItems: Array<{}>;
  requestStatusList: any = requestStatusList;
  requestAttendanceData: any;
  user: any;
  roles: any;
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 20;
  currentPage: number = 1;

  constructor(
    public router: Router,
    private activeRoute: ActivatedRoute,
    private attendanceService: AttendanceService,

  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.roles = this.user?.user?.roles;
  }

  ngOnInit(): void {

    this.getRequestAttendanceList()
  }

  navigateToRequest() {
    this.router.navigate(['attendance/request']);
  }


  async getRequestAttendanceList() {
    (await this.attendanceService.getAttendanceRequestAll(this.offset, this.limit,)).subscribe({
      next: (res: any) => {
        this.RequestData = res?.data
        this.totalRecords = res?.totalRecord || 0;
        this.getPageNumbers();
      },
      error: (error) => {
        console.error('Error retrieving attendance data:', error);
      }
    });
  }


  async rejectRequest(id: string) {
    Swal.fire({
      title: 'Are you sure? You won\'t be able to revert this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'No, cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          (await this.attendanceService.deleteRequest(id)).subscribe(
            (deleteRes) => {
              Swal.fire('Deleted!', 'The request has been deleted successfully.', 'success');
              this.getRequestAttendanceList();
            },
            (deleteError) => {
              console.error('Error deleting request:', deleteError);
              Swal.fire('Error!', 'There was an error deleting the request.', 'error');
            }
          );

        } catch (error) {
          console.error('Unexpected error:', error);
        }
      }
    });
  }


  async approveRequest(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'No, cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newStatus = '1';
        item.status = newStatus;
        (await this.attendanceService.updateRequest(item, { status: newStatus })).subscribe(
          (res) => {
            Swal.fire('Success!', 'The request has been approved.', 'success');
            this.updateStatus(item?.id, newStatus); 
          },
          (error) => {
            console.error('Error approving request:', error);
            Swal.fire('Error!', 'There was an error approving the request.', 'error');
          }
        );
      }
    });
  }



  updateStatus(id: string, newStatus: string) {
    const index = this.RequestData.findIndex(item => item.id === id);
    if (index !== -1) {
      this.RequestData[index].status = newStatus;
    }
  }


  //pagination

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1;
    this.offset = (this.currentPage - 1) * this.limit;
    this.getRequestAttendanceList()
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getRequestAttendanceList()
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
    // Generate an array of page numbers to iterate over in the template
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  goToPage(pageNumber: number): void {
    this.offset = (pageNumber - 1) * this.limit;
    this.currentPage = pageNumber;
    this.getRequestAttendanceList()
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecords) {
      this.offset += this.limit;
      this.currentPage++;
      this.getRequestAttendanceList()
    }
  }

  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 5;
    this.getRequestAttendanceList()
  }

  filter() {
    this.resetToPageOne();
  }
}
