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
  selector: "app-create-industry",
  templateUrl: "./create-industry.component.html",
  styleUrls: ["./create-industry.component.css"],
})
export class CreateIndustryComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  industryForm: FormGroup;
  id: any;
  industryData: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private generalConfigService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Industry" },
      { label: "Add Industry", active: true },
    ];

    this.industryForm = this.fb.group({
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
      this.patchIndustryById(this.id);
    }
  }

  async patchIndustryById(id) {
    (await this.generalConfigService.getIndustrybyId(id)).subscribe(
      (res) => {
        this.industryData = res;
        this.industryForm.patchValue(this.industryData);
      }
    );
  }

  onSubmit() {
    if (this.industryForm.invalid) {
      return;
    }

    const industryData = this.industryForm.value;

    const industryObj = {
      title: industryData.title,
      description: industryData.description,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the industry?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.updateIndustry(
                this.id,
                industryObj
              )
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/industry-list"]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the industry?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.postIndustry(industryObj)
            ).subscribe(() => {
              this.router.navigate(["/general-configuration/industry-list"]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/general-configuration/industry-list"]);
  }
}
