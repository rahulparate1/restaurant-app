import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../employee-management.service";
import Swal from "sweetalert2";
import { A } from "@fullcalendar/core/internal-common";
import { ApiService } from "src/app/services/api.service";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-employee-list",
  templateUrl: "./employee-list.component.html",
  styleUrls: ["./employee-list.component.css"],
})
export class EmployeeListComponent implements OnInit {
  breadCrumbItems: Array<{}>;

  filteredEmployeeList: any[] = [];
  filterByDesignation: string = "";
  filterByDepartment: string = "";
  filterByEmployeeType: string = "";
  filterBy: string = "";
  sortBy: string = ""; // New property to hold sorting option

  designationList: any[] = [];
  departmentList: any[] = [];
  employeeTypeList: any[] = ["OnRoll", "Contractor"];
  appliedFilters: string[] = []; // Array to store applied filters

  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 10;
  currentPage: number = 1;
  loadingTrans: boolean = false;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  sortOptions = [
    { label: 'Employee Name', value: 'name' },
    { label: 'Employee ID', value: 'employeeCode' },
    { label: 'Date of Joining', value: 'dateOfJoining' }
  ];
  statusCount: any;

  constructor(
    public router: Router,
    private employeeService: EmployeeManagementService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Manage Employee" },
      { label: "list", active: true },
    ];

    this.getEmployeeList();
    this.getStatusCountData();
  }

  // Fetch the employee list
  async getEmployeeList() {
    // this.apiService.startLoader();
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
        search,
      )
    ).subscribe(
      (res) => {
        this.filteredEmployeeList = res?.data || [];
        this.totalRecords = res?.totalRecord || 0;
        // Apply sorting if the sortBy value is set
        if (this.sortBy) {
          this.applySort(this.sortBy);
        }
        this.updateAppliedFilters();
        this.getPageNumbers();
        this.populateFilters(res?.data);
        this.apiService.stopLoader();
      },
      (error) => {
        console.error("Error fetching employee data", error);
      },
    );
  }

  getSortLabel(): string {
    const selectedSortOption = this.sortOptions.find(option => option.value === this.sortBy);
    return selectedSortOption ? selectedSortOption.label : 'Select'; // Default to 'Select' if no match
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
    this.limit = 10;
    this.getEmployeeList();
  }

  filter() {
    this.resetToPageOne();
  }

  // Update the applied filters array
  updateAppliedFilters() {
    this.appliedFilters = [];
    if (this.filterBy) {
      this.appliedFilters.push(`Search: ${this.filterBy}`);
    }
    if (this.filterByDesignation) {
      this.appliedFilters.push(`Designation: ${this.filterByDesignation}`);
    }
    if (this.filterByDepartment) {
      this.appliedFilters.push(`Department: ${this.filterByDepartment}`);
    }
    if (this.filterByEmployeeType) {
      this.appliedFilters.push(`Employee Type: ${this.filterByEmployeeType}`);
    }
    if (this.sortBy) {
      this.appliedFilters.push(`Sort: ${this.sortOptions.find(option => option.value === this.sortBy)?.label}`);
    }
  }

  resetFilter(filter: string) {
    switch (filter) {
      case 'search':
        this.filterBy = '';
        break;
      case 'designation':
        this.filterByDesignation = '';
        break;
      case 'department':
        this.filterByDepartment = '';
        break;
      case 'employeeType':
        this.filterByEmployeeType = '';
        break;
      case 'sort':
        this.sortBy = '';
        break;
    }
    this.resetToPageOne();
    this.getEmployeeList(); // Refresh the employee list with the updated filters
  }

  reset() {
    this.filterBy = "";
    this.filterByDesignation = "";
    this.filterByDepartment = "";
    this.filterByEmployeeType = "";
    this.sortBy = "";
    this.resetToPageOne();
    this.getEmployeeList();
  }

  // Delete an employee
  deleteEmployee(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.employeeService.deleteEmployee(id)).subscribe(
            () => {
              this.getEmployeeList();
            },
            (error) => {
              console.error("Error deleting employee", error);
            }
          );
        }
      });
  }

  // Component method to inactive employee
suspendEmployee(id: any) {
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure you want to inactive this employee?",
      confirmButtonText: "Yes, Inactive!",
      cancelButtonText: "No",
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.value) {
        (await this.employeeService.suspendEmployee(id)).subscribe(
          () => {
            // Refresh the employee list after suspension
            this.getEmployeeList();  // Update the list of employees with their updated status
          },
          (error) => {
            console.error("Error suspending employee", error);
          }
        );
      }
    });
}

 // Component method to active employee
 activeEmployee(id: any) {
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure you want to active this employee?",
      confirmButtonText: "Yes, Active!",
      cancelButtonText: "No",
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.value) {
        (await this.employeeService.activeEmployee(id)).subscribe(
          () => {

            this.getEmployeeList();
          },
          (error) => {
            console.error("Error active employee", error);
          }
        );
      }
    });
}

  // Navigate to employee details page
  goToDetails(id) {
    let link = "/employee/details/" + id;
    window.location.href = window.location.origin + link;
  }

  goToEdit(id) {
    let link = "/employee/employee/" + id + "/basic-details";
    window.location.href = window.location.origin + link;
  }

  addEmployee() {
    let link = "/employee/employee/basic-details-form";
    window.location.href = window.location.origin + link;
  }

  // Method to apply sorting based on the selected value
  applySort(sortBy: string) {
    if (sortBy === "name") {
      this.filteredEmployeeList.sort((a, b) => {
        const nameA =
          (a?.basicDetails?.firstName || "") +
          (a?.basicDetails?.lastName || "");
        const nameB =
          (b?.basicDetails?.firstName || "") +
          (b?.basicDetails?.lastName || "");
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "employeeCode") {
      this.filteredEmployeeList.sort((a, b) => {
        const codeA = a?.basicDetails?.employeeCode || "";
        const codeB = b?.basicDetails?.employeeCode || "";
        return codeA.localeCompare(codeB);
      });
    } else if (sortBy === "dateOfJoining") {
      this.filteredEmployeeList.sort((a, b) => {
        const dateA = new Date(a?.basicDetails?.dateOfJoining).getTime();
        const dateB = new Date(b?.basicDetails?.dateOfJoining).getTime();
        return dateA - dateB; // Ascending order
      });
    }
  }

  // Fetch status count
  async getStatusCountData() {
    (await this.employeeService.getStatusCount()).subscribe(
      (res) => {
        this.statusCount = res;
      },
      (error) => {
        console.error("Error fetching status count data", error);
      },
    );
  }
}
