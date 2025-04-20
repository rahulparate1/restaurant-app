import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../../employee-management.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-employee-list-view",
  templateUrl: "./employee-list-view.component.html",
  styleUrls: ["./employee-list-view.component.css"],
})
export class EmployeeListViewComponent {
  breadCrumbItems: Array<{}>;

  filteredEmployeeList: any[] = [];
  filterByDesignation: string = "";
  filterByDepartment: string = "";
  filterByEmployeeType: string = "";
  filterBy: string = "";

  designationList: any[] = [];
  departmentList: any[] = [];
  employeeTypeList: any[] = ["OnRoll", "Contractor"];

  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 8;
  currentPage: number = 1;
  loadingTrans: boolean = false;

  constructor(
    public router: Router,
    private activeRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Employee List" },
      { label: "list", active: true },
    ];
    this.getEmployeeList();
  }

  async getEmployeeList() {
    this.loadingTrans = true;
    let search: any = {};

    // Apply search filter if there's input in search field
    if (this.filterBy) {
      search["basicDetails.firstName"] = {
        like: ".*" + this.filterBy + ".*",
        options: "i",
      };
    }

    // Apply designation filter
    if (this.filterByDesignation) {
      search["basicDetails.designation.title"] = this.filterByDesignation;
    }

    // Apply department filter
    if (this.filterByDepartment) {
      search["basicDetails.department.departmentName"] =
        this.filterByDepartment;
    }

    // Apply employee type filter
    if (this.filterByEmployeeType) {
      search["basicDetails.employeeType"] = this.filterByEmployeeType;
    }

    // Make the API request to get the filtered employee list
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
        this.populateFilters(res?.data);
      },
      (error) => {
        console.error("Error fetching employee data", error);
      },
      () => {
        this.loadingTrans = false;
      }
    );
  }

  // Populate filters (designation, department, employeeType) based on the fetched data
  populateFilters(data: any[]) {
    this.designationList = Array.from(
      new Set(data?.map((item) => item?.basicDetails?.designation.title))
    );
    this.departmentList = Array.from(
      new Set(
        data?.map((item) => item?.basicDetails?.department.departmentName)
      )
    );
    this.employeeTypeList = Array.from(
      new Set(data?.map((item) => item?.basicDetails?.employeeType))
    );
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
    this.limit = 8;
    this.getEmployeeList();
  }

  filter() {
    this.resetToPageOne();
  }

  resetFilter(filter: string) {
    switch (filter) {
      case "search":
        this.filterBy = "";
        break;
      case "designation":
        this.filterByDesignation = "";
        break;
      case "department":
        this.filterByDepartment = "";
        break;
      case "employeeType":
        this.filterByEmployeeType = "";
        break;
    }
    this.resetToPageOne();
    this.getEmployeeList(); // Refresh the employee list with the updated filters
  }

  // Navigate to employee details page
  goToDetails(id) {
    let link = "/employee/employee-details/" + id;
    window.location.href = window.location.origin + link;
  }
}
