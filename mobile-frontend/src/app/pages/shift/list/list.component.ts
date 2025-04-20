import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ShiftService } from '../shift.service';
import Swal from 'sweetalert2';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DEPARTMENTS } from 'full/shared/constant';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  user: any;
  filterBy = "";
  shiftListData: any[] = [];
  originalShiftListData: any[] = [];
  displayedShifts: any[] = [];
  shiftListDetails: any;
  selectedDepartment: string = '';

  // Pagination properties
  currentPage: number = 1;
  limit: number = 5;
  totalRecords: number = 0;
  departments = DEPARTMENTS;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  constructor(
    public router: Router,
    private ShiftService: ShiftService,
    private service: ApiService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Shift" },
      { label: "List", active: true },
    ];
    this.getShiftList();
    
    
  }

  // Fetching the Shift list (vaishnavi)
  async getShiftList() {
    (await this.ShiftService.getShiftList()).subscribe((res: any) => {
      this.originalShiftListData = res;
      this.applyFilters();
    });
  }

  // Apply filters and pagination (vaishnavi)
  applyFilters() {
    let filteredData = [...this.originalShiftListData];

    // Apply text search filter
    if (this.filterBy) {
      filteredData = filteredData.filter(item =>
        item.shiftName.toLowerCase().includes(this.filterBy.toLowerCase())
      );
    }

    // Apply department filter (vaishnavi)
    if (this.selectedDepartment) {
      filteredData = filteredData.filter(item =>
        item.departments?.toLowerCase() === this.selectedDepartment.toLowerCase()
      );
    }

    // Update filtered data and pagination (vaishnavi)
    this.shiftListData = filteredData;
    this.totalRecords = this.shiftListData.length;
    this.currentPage = 1;
    this.updateDisplayedShifts();
  }


  // Update shifts to display based on current page and limit (vaishnavi)
  updateDisplayedShifts() {
    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.displayedShifts = [...this.shiftListData.slice(start, end)];
    this.cdr.detectChanges();
  }

  // Navigate to the next page (vaishnavi)
  nextPage() {
    if ((this.currentPage * this.limit) < this.totalRecords) {
      this.currentPage++;
      this.updateDisplayedShifts();
    }
  }

  // Navigate to the previous page (vaishnavi)
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedShifts();
    }
  }

  // Returns the total number of pages based on total records and limit (vaishnavi)
  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.limit);
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
      this.currentPage = pageNumber;
      this.updateDisplayedShifts();
    }
  }


  // Returns an array of page numbers for pagination display (vaishnavi)
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }


  // Filter by text input (vaishnavi)
  filter() {
    this.applyFilters();
  }

  // Filter by department (vaishnavi)
  filterByDepartment() {
    this.applyFilters();
  }

  // Modal for shift details (vaishnavi)
  centerModal(centerDataModal: any, item: any) {
    this.shiftListDetails = item;
    this.modalService.open(centerDataModal, { centered: true });
  }

  // Delete Shift by Id (vaishnavi)
  async deleteShift(id) {
    swalWithBootstrapButtons.fire({
      title: "Are you sure? You won't be able to revert this!",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "No",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.ShiftService.deleteActivity(id)).subscribe(() => {
          this.getShiftList();
        });
      }
    });
  }

  // On Edit button click (vaishnavi)
  onEdit(id) {
    this.router.navigate(["/shift/create-shift/" + id]);
  }

  // function for time conversion (vaishnavi)
  convertToDate(time: string): Date {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    now.setHours(Number(hours), Number(minutes), 0, 0);
    return now;
  }

  reset() {
    this.filterBy = "";
    this. getShiftList();
  }

  CreateShift() {
    this.router.navigate(["shift/create-shift"]);
  }

}
