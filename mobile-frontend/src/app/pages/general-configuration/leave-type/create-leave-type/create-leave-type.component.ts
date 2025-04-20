import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
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
  selector: 'app-create-leave-type',
  templateUrl: './create-leave-type.component.html',
  styleUrls: ['./create-leave-type.component.css']
})
export class CreateLeaveTypeComponent {

  // bread crumb items
    breadCrumbItems: Array<{}>;

    leaveTypeForm: FormGroup;
    id: any;
    leaveTypeData: any;

    constructor(
      private router: Router,
      private fb: FormBuilder,
      private activeRoute: ActivatedRoute,
      private generalConfigService: GeneralConfigurationService
    ) {}

    ngOnInit(): void {
      this.id = this.activeRoute.snapshot.paramMap.get("id");
      this.breadCrumbItems = [
        { label: "Leave Type" },
        { label: "Add Leave Type", active: true },
      ];

      this.leaveTypeForm = this.fb.group({
        name: [
          "",
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(50),
          ],
        ],
        description: ["", [Validators.required]],
      });
      if (this.id) {
        this.patchLeaveTypeById(this.id);
      }
    }

    async patchLeaveTypeById(id) {
      (await this.generalConfigService.getLeaveTypebyId(id)).subscribe(
        (res) => {
          this.leaveTypeData = res;
          this.leaveTypeForm.patchValue(this.leaveTypeData);
        }
      );
    }

    onSubmit() {
      if (this.leaveTypeForm.invalid) {
        return;
      }

      const leaveTypeData = this.leaveTypeForm.value;

      const leaveTypeObj = {
        name: leaveTypeData.name,
        description: leaveTypeData.description,
      };

      if (this.id) {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to update the leaveType?",
            confirmButtonText: "Yes, Update!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (
                await this.generalConfigService.updateLeaveType(
                  this.id,
                  leaveTypeObj
                )
              ).subscribe(() => {
                this.router.navigate(["/general-configuration/leaveType-list"]);
              });
            }
          });
      } else {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to add the leaveType?",
            confirmButtonText: "Yes, Add!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (
                await this.generalConfigService.postLeaveType(leaveTypeObj)
              ).subscribe(() => {
                this.router.navigate(["/general-configuration/leaveType-list"]);
              });
            }
          });
      }
    }

    navigateToList() {
      this.router.navigate(["/general-configuration/leaveType-list"]);
    }

}
