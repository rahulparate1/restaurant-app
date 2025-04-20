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
  selector: 'app-leave-type-list',
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.css']
})
export class LeaveTypeListComponent {

  breadCrumbItems: Array<{}>;
    leaveTypeList: any;
    leaveTypeData: any[];
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
        { label: "Leave Type List" },
        { label: "list", active: true },
      ];

      this.getLeavetypeList();
    }

    // Fetch the leave type list
    async getLeavetypeList() {
      (await this.generalConfigService.getLeaveType()).subscribe(
        (res) => {
          this.leaveTypeList = res || [];
          this.leaveTypeData = [...this.leaveTypeList];
        },
        (error) => {
          console.error("Error fetching leave type data", error);
        }
      );
    }

    filter() {
      this.leaveTypeData = [
        ...this.leaveTypeList.filter((item) =>
          item.name.toLowerCase().includes(this.filterBy.toLowerCase())
        ),
      ];
    }

    // Delete an designation
    deleteLeaveType(id: any) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure, You won't be able to revert this?",
          confirmButtonText: "Yes, Delete!",
          cancelButtonText: "No",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.generalConfigService.deleteLeaveType(id)).subscribe(
              () => {
                this.getLeavetypeList();
              },
              (error) => {
                console.error("Error deleting leave type", error);
              }
            );
          }
        });
    }

    onEdit(id) {
      this.router.navigate(["/general-configuration/leaveType-form/" + id]);
    }

    addLeaveType() {
      this.router.navigate(["/general-configuration/leaveType-form"]);
    }

}
