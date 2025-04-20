import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { GeneralConfigurationService } from "../../general-configuration.service";
import Swal from "sweetalert2";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-work-location-list",
  templateUrl: "./work-location-list.component.html",
  styleUrls: ["./work-location-list.component.css"],
})
export class WorkLocationListComponent {
  breadCrumbItems: Array<{}>;
  workLocationList: any;
  workLocationData: any[];
  filterBy;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  workLocationListDetails: any;

  constructor(
    public router: Router,
    private modalService: NgbModal,
    private generalConfigService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Work Location List" },
      { label: "list", active: true },
    ];

    this.getWorkLocationList();
  }

  // Fetch the work location list
  async getWorkLocationList() {
    (await this.generalConfigService.getWorkLocation()).subscribe(
      (res) => {
        this.workLocationList = res || [];
        this.workLocationData = [...this.workLocationList];
      },
      (error) => {
        console.error("Error fetching work location data", error);
      }
    );
  }

  filter() {
    this.workLocationData = [
      ...this.workLocationList.filter((item) =>
        item.workLocationName.toLowerCase().includes(this.filterBy.toLowerCase())
      ),
    ];
  }

  // Delete a work location
  deleteWorkLocation(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.generalConfigService.deleteWorkLocation(id)).subscribe(
            () => {
              this.getWorkLocationList();
            },
            (error) => {
              console.error("Error deleting work location", error);
            }
          );
        }
      });
  }

   centerModal(centerDataModal: any, item: any) {
    this.workLocationListDetails = item;
    this.modalService.open(centerDataModal, { centered: true });
  }

  onEdit(id) {
    this.router.navigate(["/general-configuration/work-location-form/" + id]);
  }

  addWorkLocation() {
    this.router.navigate(["/general-configuration/work-location-form"]);
  }
}
