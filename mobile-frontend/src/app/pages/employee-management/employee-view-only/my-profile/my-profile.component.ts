import { Component } from "@angular/core";
import { EmployeeManagementService } from "../../employee-management.service";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-my-profile",
  templateUrl: "./my-profile.component.html",
  styleUrls: ["./my-profile.component.css"],
})
export class MyProfileComponent {
  id: any;
  employeeDetails: any;
  basicDetailsData: Object;
  employeeTemp: any;
  updatedData: any;
  firstName: any;
  lastName: any;
  department: any;
  designation: any;
  middleName: any;
  employeeCode: any;
  employeeType: any;
  email: any;
  mobileNo: any;
  image: any;
  shift: any;
  workLocation: any;
  dateOfJoining: any;
  manager: any;
  gender: any;
  employeeTempData: any;
  editEmployeeForm: any = null;
  isModalOpen = false;

  constructor(
    private employeeService: EmployeeManagementService,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.getEmployeeDetails();
  }

  // Fetch employee details
  async getEmployeeDetails() {
    (await this.employeeService.getEmployeeView1()).subscribe((res: any) => {
      this.employeeDetails = res;
      this.firstName = this.employeeDetails.basicDetails.firstName;
      this.lastName = this.employeeDetails.basicDetails.lastName;
      this.mobileNo = this.employeeDetails.basicDetails.mobileNo;
      this.image = this.employeeDetails.basicDetails.image;
    });
  }

  async updateBasicDetails() {
    let userEmployeeId = JSON.parse(localStorage.getItem("payoutUser"))?.employee?.id;
    const updatedData = {
      temporaryObj: {
        firstName: this.firstName || "",
        lastName: this.lastName || "",
        mobileNo: this.mobileNo || "",
        email: this.employeeDetails.basicDetails.email || "",
        designation: this.employeeDetails.basicDetails.designation || "",
        middleName: this.employeeDetails.basicDetails.middleName || "",
        employeeCode: this.employeeDetails.basicDetails.employeeCode || "",
        managerAssign: this.employeeDetails.basicDetails.managerAssign || "",
        dateOfJoining: this.employeeDetails.basicDetails.dateOfJoining || "",
        department: this.employeeDetails.basicDetails.department || "",
        employeeType: this.employeeDetails.basicDetails.employeeType || "",
        workLocation: this.employeeDetails.basicDetails.workLocation || "",
        shift: this.employeeDetails.basicDetails.shift || "",
        gender: this.employeeDetails.basicDetails.gender || "",
        image: this.image || "",
        isDirector: this.employeeDetails.basicDetails.isDirector || false,
      },
      oldData: {
        ...this.employeeDetails.basicDetails,
      },
      EmployeeId :userEmployeeId
    };
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to update this?",
        confirmButtonText: "Yes, Update!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.employeeService.postOverview1(updatedData)).subscribe(
            (res) => {
              this.updatedData = res;
              this.modalService.dismissAll();
            }
          );
        }
      });
  }

  basicDetailsModal(basicDataModal: any) {
    this.modalService.open(basicDataModal, { size: "xl", centered: true });
  }
}
