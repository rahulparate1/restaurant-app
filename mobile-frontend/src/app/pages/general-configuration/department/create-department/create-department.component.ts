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
  selector: "app-create-department",
  templateUrl: "./create-department.component.html",
  styleUrls: ["./create-department.component.css"],
})
export class CreateDepartmentComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  departmentForm: FormGroup;
  id: any;
  departmentData: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private generalConfigService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Department" },
      { label: "Add Department", active: true },
    ];

    this.departmentForm = this.fb.group({
      departmentName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      departmentCode: [
        "",
        [Validators.required, Validators.pattern("^[0-9]{3}$")],
      ],
      description: ["", [Validators.required]],
    });
    if (this.id) {
      this.patchDepartmentById(this.id);
    }
  }

  async patchDepartmentById(id) {
    (await this.generalConfigService.getDepartmentbyId(id)).subscribe((res) => {
      this.departmentData = res;
      this.departmentForm.patchValue(this.departmentData);
    });
  }

  onSubmit() {
    if (this.departmentForm.invalid) {
      return;
    }

    const departmentData = this.departmentForm.value;

    const departmentObj = {
      departmentName: departmentData.departmentName,
      departmentCode: departmentData.departmentCode,
      description: departmentData.description,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the department?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.updateDepartment(
                this.id,
                departmentObj
              )
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/department-list"]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the department?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.postDepartment(departmentObj)
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/department-list"]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/general-configuration/department-list"]);
  }
}
