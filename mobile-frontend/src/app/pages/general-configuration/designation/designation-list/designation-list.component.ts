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
  selector: "app-designation-list",
  templateUrl: "./designation-list.component.html",
  styleUrls: ["./designation-list.component.css"],
})
export class DesignationListComponent {
  breadCrumbItems: Array<{}>;
  designationList: any;
  designationData: any[];
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
      { label: "Designation List" },
      { label: "list", active: true },
    ];

    this.getDesignationList();
  }

  // Fetch the designation list
  async getDesignationList() {
    (await this.generalConfigService.getDesignation()).subscribe(
      (res) => {
        this.designationList = res || [];
        this.designationData = [...this.designationList];
      },
      (error) => {
        console.error("Error fetching designation data", error);
      }
    );
  }

  filter() {
    this.designationData = [
      ...this.designationList.filter((item) =>
        item.title.toLowerCase().includes(this.filterBy.toLowerCase())
      ),
    ];
  }

  // Delete an designation
  deleteDesignation(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.generalConfigService.deleteDesignation(id)).subscribe(
            () => {
              this.getDesignationList();
            },
            (error) => {
              console.error("Error deleting designation", error);
            }
          );
        }
      });
  }

  onEdit(id) {
    this.router.navigate(["/general-configuration/designation-form/" + id]);
  }

  addDesignation() {
    this.router.navigate(["/general-configuration/designation-form"]);
  }
}
