import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../../employee-management/employee-management.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ShiftService } from '../shift.service';

@Component({
  selector: 'app-employee-shift',
  templateUrl: './employee-shift.component.html',
  styleUrls: ['./employee-shift.component.css']
})
export class EmployeeShiftComponent implements OnInit {
  filteredEmployeeList: any[] = [];
  filterBy: string = "";
  formData: FormGroup;
  submitted = false;
  shiftListData: any;
  breadCrumbItems: Array<{}>;
  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 5;
  currentPage: number = 1;
  loadingTrans: boolean = false;
  shiftListDetails: any;

  
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  constructor(
    public router: Router,
    private modalService: NgbModal,
    private employeeService: EmployeeManagementService,
    private ShiftService: ShiftService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Employee Shift" },
      { label: "Employee Shift Mapping", active: true },
    ];
    this.getEmployeeList();
    this.getShiftList()
    this.formData = this.fb.group({
      shiftName: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  // Fetch the employee list
  async getEmployeeList() {
    this.loadingTrans = true;
    let search: any = {};
    if (this.filterBy) {
      search["basicDetails.firstName"] = {
        like: ".*" + this.filterBy + ".*",
        options: "i",
      };
    }
    (
      await this.employeeService.getEmployeeFilter(
        this.offset,
        this.limit,
        search
      )
    ).subscribe(
      (res) => {
        this.filteredEmployeeList = res?.data || [];
        this.totalRecords = res?.totalRecord || 0;
        this.getPageNumbers();
      },
      (error) => {
        console.error("Error fetching employee data", error);
      },
      () => {
        this.loadingTrans = false;
      }
    );
  }

  async shiftForm() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }
    const data = this.formData.value;
    (await this.employeeService.updateEmployee(this.shiftListDetails?.id, data)).subscribe((res: any) => {
      this.modalService.dismissAll();
    });

  }

  // Fetching the Shift list (vaishnavi)
  async getShiftList() {
    (await this.ShiftService.getShiftList()).subscribe((res: any) => {
      this.shiftListData = res;
    });
  }

  // Modal for shift details (vaishnavi)
  centerModal(centerDataModal: any, item: any) {
    this.shiftListDetails = item;
    this.modalService.open(centerDataModal, { centered: true });
  }


  //pagination

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1;
    this.offset = (this.currentPage - 1) * this.limit;
    this.getEmployeeList();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.getEmployeeList();
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
    this.getEmployeeList();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecords) {
      this.offset += this.limit;
      this.currentPage++;
      this.getEmployeeList();
    }
  }

  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 5;
    this.getEmployeeList();
  }

  filter() {
    this.resetToPageOne();
  }

  reset() {
    this.filterBy = "";
    this.getEmployeeList();
  }
}
