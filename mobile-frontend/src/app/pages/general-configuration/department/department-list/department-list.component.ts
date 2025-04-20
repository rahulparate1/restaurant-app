import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { GeneralConfigurationService } from "../../general-configuration.service";
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
  selector: "app-department-list",
  templateUrl: "./department-list.component.html",
  styleUrls: ["./department-list.component.css"],
})
export class DepartmentListComponent {
  breadCrumbItems: Array<{}>;
  departmentList: any;
  departmentData: any[];
  filterBy;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  constructor(
    public router: Router,
    private generalConfigService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Department List" },
      { label: "list", active: true },
    ];

    this.getDepartmentList();
  }

  // Fetch the department list
  async getDepartmentList() {
    (await this.generalConfigService.getDepartment()).subscribe(
      (res) => {
        this.departmentList = res || [];
        this.departmentData = [...this.departmentList];
      },
      (error) => {
        console.error("Error fetching department data", error);
      }
    );
  }

  filter() {
    this.departmentData = [
      ...this.departmentList.filter((item) =>
        item.departmentName.toLowerCase().includes(this.filterBy.toLowerCase())
      ),
    ];
  }

  // Delete an department
  deleteDepartment(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.generalConfigService.deleteDepartment(id)).subscribe(
            () => {
              this.getDepartmentList();
            },
            (error) => {
              console.error("Error deleting department", error);
            }
          );
        }
      });
  }

  onEdit(id) {
    this.router.navigate(["/general-configuration/department-form/" + id]);
  }

  addDepartment() {
    this.router.navigate(["/general-configuration/department-form"]);
  }
}
