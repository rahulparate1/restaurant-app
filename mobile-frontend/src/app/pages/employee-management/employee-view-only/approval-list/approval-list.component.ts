import { Component } from "@angular/core";
import { EmployeeManagementService } from "../../employee-management.service";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiService } from "src/app/services/api.service";
@Component({
  selector: "app-approval-list",
  templateUrl: "./approval-list.component.html",
  styleUrls: ["./approval-list.component.css"],
})
export class ApprovalListComponent {
  breadCrumbItems: Array<{}>;
  employees = [];
  selectedEmployee: any = null;
  employeeId: any;
  id: string;

  filteredEmployeeList: any[] = [];
  filterByDesignation: string = "";
  filterByDepartment: string = "";
  filterByEmployeeType: string = "";
  filterByStatus: string = "";
  filterBy: string = "";

  designationList: any[] = [];
  departmentList: any[] = [];
  statusList: any[] = [];
  employeeTypeList: any[] = ["OnRoll", "Contractor"];

  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 10;
  currentPage: number = 1;
  loadingTrans: boolean = false;
  appliedFilters: string[] = [];
  dataId: any;

  constructor(
    private employeeService: EmployeeManagementService,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Employee List" },
      { label: "list", active: true },
    ];
    this.getEmployeeList();
  }

  // Fetch the employee list
  async getEmployeeList() {
    let search: any = {};

    // Apply search filter if there's input in search field
    if (this.filterBy) {
      search["temporaryObj.firstName"] = {
        like: ".*" + this.filterBy + ".*",
        options: "i",
      };
    }

    // Apply designation filter
    if (this.filterByDesignation) {
      search["temporaryObj.designation.title"] = this.filterByDesignation;
    }

    // Apply department filter
    if (this.filterByDepartment) {
      search["temporaryObj.department.departmentName"] = this.filterByDepartment;
    }

    // Apply employee type filter
    if (this.filterByEmployeeType) {
      search["temporaryObj.employeeType"] = this.filterByEmployeeType;
    }

    // Make the API request to get the filtered employee list
    (
      await this.employeeService.getTempData(this.offset, this.limit, search)
    ).subscribe(
      (res) => {
        this.employees = res.data || [];
        this.dataId =  res.data.EmployeeId;
        this.totalRecords = res?.totalRecord || 0;
        this.updateAppliedFilters();
        this.getPageNumbers();
        this.populateFilters(res.data);
      },
      (error) => {
        console.error("Error fetching employee data", error);
      },
    );
  }

  // Populate filters (designation, department, employeeType) based on the fetched data
  populateFilters(data: any[]) {
    this.designationList = Array.from(
      new Set(data?.map((item) => item?.temporaryObj?.designation.title))
    );
    this.departmentList = Array.from(
      new Set(data?.map((item) => item?.temporaryObj?.department.departmentName))
    );
    this.employeeTypeList = Array.from(
      new Set(data?.map((item) => item?.temporaryObj?.employeeType))
    );
    this.statusList = Array.from(new Set(data?.map((item) => item?.status)));
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

  reset() {
    this.filterBy = "";
    this.filterByDesignation = "";
    this.filterByDepartment = "";
    this.filterByEmployeeType = "";
    this.filterByStatus = "";
    this.getEmployeeList();
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
    }
    this.resetToPageOne();
    this.getEmployeeList();
  }

  async updateStatus(employee: any, status: string) {
    this.apiService.startLoader();
      (
        await this.employeeService.dataPatch(
          employee?.EmployeeId,
          this.selectedEmployee?.temporaryObj
        )
      ).subscribe(
        (response) => {
          this.updateTempStatus(status);

          if (response) {
            // Update the local employee list based on the result
            const updatedEmployee = this.employees.find(
              (emp) => emp.id === employee.id
            );
            if (updatedEmployee) {
              updatedEmployee.updateStatus =
                status === "approve" ? "Approved" : "Rejected";
            }
          }
          this.modalService.dismissAll();
          this.apiService.stopLoader();
        },
        (error) => {
          console.error("Error updating employee data", error);
        }
      );
  }

  async updateTempStatus(status: string) {
    (await this.employeeService.updateEmployeeTemp(this.id, status)).subscribe(
      (response) => {
        this.modalService.dismissAll();
      },
      (error) => {
        // Handle any errors from the API request
        console.error("Error updating employee data", error);
      }
    );
  }

  // This function will be called to open the modal and populate employee data
  openApproveRejectModal(employee: any, approveRejectModal: any) {
    this.id = employee?.id;
    this.selectedEmployee = {
      ...employee,
    };
    this.approveRejectModal(approveRejectModal); // Now pass the modal reference directly
  }

  // Modal function to open the modal with the modal reference
  approveRejectModal(approveRejectModal: any) {
    this.modalService.open(approveRejectModal, {
      size: "xl",
      centered: true,
    });
  }
}
