import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ReimbursementService } from "../reimbursement.service";
import Swal from "sweetalert2";
import { reimbursementStatusList, rolesType } from "full/shared/constant";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
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
  selector: "app-reimbursement-list",
  templateUrl: "./reimbursement-list.component.html",
  styleUrls: ["./reimbursement-list.component.css"],
})
export class ReimbursementListComponent {
  breadCrumbItems: Array<{}>;
  reimbursementList: any;
  reimbursementData: any[];
  user: any;
  designation: any;
  designationRole: { key: string; value: string }[];

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  // For pagination
  pageNumber: number = 1;
  totalRecords: number = 0;
  offset: number = 0;
  limit: number = 10;
  currentPage: number = 1;

  loadingTrans: boolean = false;
  reimbursementStatusList: any = reimbursementStatusList;
  filterByExpense: string = "";
  filterByStatus: string = "";
  filterByAmount: string = "";
  filterBy: string = "";
  expenseList: any[] = [];
  statusList: any[] = [];
  approvedForm: UntypedFormGroup;
  rejectForm: UntypedFormGroup;
  id: any;
  data: any;
  approveDetails: any;
  rejectDetails: any;
  month: string = "";
  year: string = "";
  selectedMonthYear: string = "";
  minMonthYear: string = "2010-01";
  years: number[] = [];
  reimbursementTotalData: any;

  constructor(
    public router: Router,
    private reimbursementService: ReimbursementService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private apiService: ApiService
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.user?.roles[0];
  }

  ngOnInit(): void {
    this.designationRole = rolesType;
    this.breadCrumbItems = [
      { label: "Reimbursement" },
      { label: "list", active: true },
    ];

    this.id = this.id;
    this.approvedForm = this.formBuilder.group({
      comment: new FormControl("", [
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

    this.rejectForm = this.formBuilder.group({
      comment: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

    const currentMonthYear = new Date();
    this.selectedMonthYear = `${currentMonthYear.getFullYear()}-${String(
      currentMonthYear.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    this.selectedMonthYear = `${currentYear}-${currentMonth}`;
    const minYear = currentYear - 10;
    this.minMonthYear = `${minYear}-01`; // Setting January of the min year as the minimum allowed
    this.generateYears();
    this.handleReimbursementRequest();
    this.getReimbursementSummary();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i);
    }
  }

  async getReimbursementListForAdmin(searchParams: any) {
    let search: any = {};

    if (searchParams.title) {
      search.title = {
        like: ".*" + searchParams.title + ".*",
        options: "i",
      };
    }

    if (searchParams.type) {
      search.type = searchParams.type;
    }

    if (searchParams.status) {
      search.status = searchParams.status.toString();
    }

    if (searchParams.amount) {
      search.amount = searchParams.amount;
    }

    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-");
      search.month = parseInt(month);
      search.year = parseInt(year);
    }

    // Fetch the filtered data
    (
      await this.reimbursementService.getReimbursementFilter(
        this.offset,
        this.limit,
        search
      )
    ).subscribe(
      (res) => {
        this.reimbursementList = res?.data || [];
        this.reimbursementData = [...this.reimbursementList];
        this.totalRecords = res?.totalRecord || 0;
        this.getPageNumbers();
        this.populateFilters(res?.data);
      },
      (error) => {
        console.error("Error fetching reimbursement data", error);
      }
    );
  }

  async getReimbursementForEmployee(searchParams: any) {
    this.apiService.startLoader();
    let search: any = {};

    if (searchParams.title) {
      search.title = {
        like: ".*" + searchParams.title + ".*",
        options: "i",
      };
    }

    if (searchParams.type) {
      search.type = searchParams.type;
    }

    if (searchParams.status) {
      search.status = searchParams.status.toString();
    }

    if (searchParams.amount) {
      search.amount = searchParams.amount;
    }
    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split("-");
      search.month = parseInt(month);
      search.year = parseInt(year);
    }
    (
      await this.reimbursementService.getReimbursementForEmployee(
        this.offset,
        this.limit,
        search
      )
    ).subscribe(
      (res) => {
        this.reimbursementList = res?.data || [];
        this.reimbursementData = [...this.reimbursementList];
        this.totalRecords = res?.totalRecord || 0;
        this.getPageNumbers();
        this.populateFilters(res?.data);
        this.apiService.stopLoader();
      },
      (error) => {
        console.error("Error fetching employee reimbursement data", error);
      }
    );
  }

  async handleReimbursementRequest() {
    const searchParams = {
      title: this.filterBy,
      amount: this.filterByAmount,
      type: this.filterByExpense,
      status: this.filterByStatus,
      month: this.selectedMonthYear ? this.selectedMonthYear.split("-")[1] : "",
      year: this.selectedMonthYear ? this.selectedMonthYear.split("-")[0] : "",
    };
    if (this.designation === this.designationRole[1].value) {
      await this.getReimbursementListForAdmin(searchParams);
    } else if (this.designation === this.designationRole[3].value) {
      await this.getReimbursementForEmployee(searchParams);
    }
  }

  populateFilters(data: any[]) {
    this.expenseList = Array.from(
      new Set(data?.map((item) => item?.type))
    ).filter((type) => type !== undefined);
    this.statusList = this.reimbursementStatusList
      ?.map((status) => status?.id)
      .filter((id) => id !== undefined);
  }

  resetToPageOne() {
    this.pageNumber = 1;
    this.offset = 0;
    this.limit = 10;
    this.handleReimbursementRequest();
  }

  filter() {
    this.resetToPageOne();
  }

  // Reset all filters
  reset() {
    this.filter();
    this.filterBy = "";
    this.filterByAmount = "";
    this.filterByExpense = "";
    this.filterByStatus = "";
    this.selectedMonthYear = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    this.handleReimbursementRequest();
  }

  // Reset individual filters
  resetFilter(filterName: string) {
    this.filter();
    switch (filterName) {
      case "filterBy":
        this.filterBy = "";
        break;
      case "filterByAmount":
        this.filterByAmount = "";
        break;
      case "filterByExpense":
        this.filterByExpense = "";
        break;
      case "filterByStatus":
        this.filterByStatus = "";
        break;
      case "monthYear":
        this.selectedMonthYear = "";
        break;
    }
    this.resetToPageOne();
    this.handleReimbursementRequest();
  }

  resetFilters() {
    this.selectedMonthYear = "";
    this.filterBy = "";
    this.filterByAmount = "";
    this.filterByExpense = "";
    this.filterByStatus = "";
    this.handleReimbursementRequest();
  }

  onMonthYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedMonthYear = target.value;
    this.offset = 0;
    this.handleReimbursementRequest();
  }

  deleteReimbursement(id: any) {
    this.apiService.startLoader();
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.reimbursementService.deleteReimbursement(id)).subscribe(
            () => {
              this.handleReimbursementRequest();
              this.apiService.stopLoader();
            },
            (error) => {
              console.error("Error deleting work location", error);
            }
          );
        }
      });
  }

  changePageSize(newSize: number): void {
    this.limit = newSize;
    this.currentPage = Math.floor(this.offset / this.limit) + 1;
    this.offset = (this.currentPage - 1) * this.limit;
    this.handleReimbursementRequest();
  }

  previousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.currentPage--;
      this.handleReimbursementRequest();
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
    this.handleReimbursementRequest();
  }

  nextPage(): void {
    if (this.offset + this.limit < this.totalRecords) {
      this.offset += this.limit;
      this.currentPage++;
      this.handleReimbursementRequest();
    }
  }

  onEdit(id: any) {
    this.router.navigate(["/reimbursement/form/" + id]);
  }

  onDetails(id: any) {
    this.router.navigate(["/reimbursement/details/" + id]);
  }

  addReimbursement() {
    this.router.navigate(["reimbursement/form"]);
  }

  getStatusLabel(statusId: any): string {
    const status = this.reimbursementStatusList?.find(
      (leaveStatus) => leaveStatus?.id === Number(statusId)
    );
    return status ? status.label : "Unknown";
  }

  getStatusClass(statusId: string): string {
    const status = this.reimbursementStatusList.find((s) => s.id === statusId);
    return status ? status.className : "";
  }

  async updateStatusForApprove(id) {
    this.apiService.startLoader();
    const comment = this.approvedForm.get("comment").value;
    if (!this.approveDetails?.id) {
      return;
    }
    const data = {
      id: this.approveDetails.id,
      comment: comment,
    };
    try {
      (
        await this.reimbursementService.updateReimbursementByApproved(data)
      ).subscribe(
        (res) => {
          this.modalService.dismissAll();
          this.handleReimbursementRequest();
          this.apiService.stopLoader();
        },
        (error) => {
          console.error("Error updating reimbursement", error);
        }
      );
    } catch (error) {
      console.error(
        "Unexpected error occurred while updating reimbursement",
        error
      );
    }
  }

  centerModalForApprove(approveDataModal: any, item: any) {
    this.approveDetails = item;
    this.modalService.open(approveDataModal, { centered: true });
  }

  async updateStatusForReject(id) {
    this.apiService.startLoader();
    const comment = this.rejectForm.get("comment").value;
    if (!this.rejectDetails?.id) {
      console.error("Reimbursement ID is missing.");
      return;
    }
    const data = {
      id: this.rejectDetails.id,
      comment: comment,
    };
    (
      await this.reimbursementService.updateReimbursementByRejected(data)
    ).subscribe(
      (res) => {
        this.modalService.dismissAll();
        this.handleReimbursementRequest();
        this.apiService.stopLoader();
      },
      (error) => {
        console.error("Error updating reimbursement", error);
      }
    );
  }

  centerModalForReject(rejectDataModal: any, item: any) {
    this.rejectDetails = item;
    this.modalService.open(rejectDataModal, { centered: true });
  }

  async getReimbursementSummary() {
    (await this.reimbursementService.getReimbursementSummary()).subscribe(
      (res) => {
        this.reimbursementTotalData = res || [];
      },
      (error) => {
        console.error("Error fetching employee reimbursement data", error);
      }
    );
  }
}
