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
  selector: "app-create-designation",
  templateUrl: "./create-designation.component.html",
  styleUrls: ["./create-designation.component.css"],
})
export class CreateDesignationComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  designationForm: FormGroup;
  id: any;
  designationData: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private generalConfigService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Designation" },
      { label: "Add Designation", active: true },
    ];

    this.designationForm = this.fb.group({
      title: [
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
      this.patchDesignationById(this.id);
    }
  }

  async patchDesignationById(id) {
    (await this.generalConfigService.getDesignationbyId(id)).subscribe(
      (res) => {
        this.designationData = res;
        this.designationForm.patchValue(this.designationData);
      }
    );
  }

  onSubmit() {
    if (this.designationForm.invalid) {
      return;
    }

    const designationData = this.designationForm.value;

    const designationObj = {
      title: designationData.title,
      description: designationData.description,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the designation?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.updateDesignation(
                this.id,
                designationObj
              )
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/designation-list"]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the designation?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.postDesignation(designationObj)
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/designation-list"]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/general-configuration/designation-list"]);
  }
}
