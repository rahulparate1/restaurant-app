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
  selector: "app-industry-list",
  templateUrl: "./industry-list.component.html",
  styleUrls: ["./industry-list.component.css"],
})
export class IndustryListComponent {
  breadCrumbItems: Array<{}>;
  industryList: any;
  industryData: any[];
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
      { label: "Industry List" },
      { label: "list", active: true },
    ];

    this.getIndustryList();
  }

  // Fetch the industry list
  async getIndustryList() {
    (await this.generalConfigService.getIndustry()).subscribe(
      (res) => {
        this.industryList = res || [];
        this.industryData = [...this.industryList];
      },
      (error) => {
        console.error("Error fetching industry data", error);
      }
    );
  }

  filter() {
    this.industryData = [
      ...this.industryList.filter((item) =>
        item.title.toLowerCase().includes(this.filterBy.toLowerCase())
      ),
    ];
  }

  // Delete an industry
  deleteIndustry(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.generalConfigService.deleteIndustry(id)).subscribe(
            () => {
              this.getIndustryList();
            },
            (error) => {
              console.error("Error deleting industry", error);
            }
          );
        }
      });
  }

  onEdit(id) {
    this.router.navigate(["/general-configuration/industry-form/" + id]);
  }

  addIndustry() {  // Renamed method
    this.router.navigate(["/general-configuration/industry-form"]);
  }
}
