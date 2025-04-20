import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CompanyConfigurationService } from "../company-configuration.service";
import { GeneralConfigurationService } from "../../general-configuration/general-configuration.service";
import { ImageExtensions, rolesType } from "full/shared/constant";
import { Country, State, City } from "country-state-city";

@Component({
  selector: "app-organisation-details-form",
  templateUrl: "./organisation-details-form.component.html",
  styleUrls: ["./organisation-details-form.component.css"],
})
export class OrganisationDetailsFormComponent {
  breadCrumbItems: Array<{}>;
  organisationForm: FormGroup;
  organisationData: any;
  organisationCompanyData: any;
  user: any;
  companyId: any;
  status: string;
  file: any;
  image;
  industryTypeDate: any[];
  fileError: any;
  fileExtensionError: boolean;

  selectedFile: File | undefined;
  designation: any;
  designationRole: { key: string; value: string }[];
  companyName: any;

  //Variables to fetch states and cities
  cities: any;
  states: any;
  selectedState: any;
  selectedCity: any;
  isEditMode: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private companyService: CompanyConfigurationService,
    private industryService: GeneralConfigurationService
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.companyId = JSON.parse(
      localStorage.getItem("payoutUser")
    )?.company?.id;
    this.breadCrumbItems = [
      { label: "Company" },
      { label: "Company Details", active: true },
    ];
    this.designationRole = rolesType;

    this.organisationForm = this.fb.group({
      organisationName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      industry: ["", [Validators.required]],
      address1: ["", [Validators.required]],
      address2: ["", [Validators.required]],
      country: ["India", [Validators.required]],
      state: ["", [Validators.required]],
      city: ["", [Validators.required]],
      pincode: [
        "",
        [Validators.required, Validators.pattern("^[1-9][0-9]{5}$")],
      ],
    });
    this.onCountryChange();
    this.getOrganisationDetails();
    this.getIndustryTypeList();
  }

  get form() {
    return this.organisationForm.controls;
  }

  async getOrganisationDetails() {
    (await this.companyService.getCompanyDetails(this.companyId)).subscribe(
      (res) => {
        this.organisationCompanyData = res;
        this.organisationForm.patchValue({
          organisationName: this.user?.company?.companyName || "",
          industry: this.organisationCompanyData?.organisationDetails?.industry,
          address1: this.organisationCompanyData?.organisationDetails?.address1,
          address2: this.organisationCompanyData?.organisationDetails?.address2,
          country: this.organisationCompanyData?.organisationDetails?.country,
          state: this.organisationCompanyData?.organisationDetails?.state,
          city: this.organisationCompanyData?.organisationDetails?.city?.name,
          pincode: this.organisationCompanyData?.organisationDetails?.pincode,
        });
        this.image = this.organisationCompanyData?.organisationDetails?.image;
      },
      (err) => {}
    );
  }

  async onSubmit() {
    let organisationObj: any = {};
    organisationObj.organisationName =
      this.organisationForm.value.organisationName;
    organisationObj.industry = this.organisationForm.value.industry;
    organisationObj.address1 = this.organisationForm.value.address1;
    organisationObj.address2 = this.organisationForm.value.address2;
    organisationObj.country = this.organisationForm.value.country;
    organisationObj.state = this.organisationForm.value.state;
    organisationObj.city = this.organisationForm.value.city;
    organisationObj.pincode = this.organisationForm.value.pincode;
    organisationObj.status = "completed";
    if (this.organisationForm.status != "INVALID") {
      let companyId = JSON.parse(localStorage.getItem("payoutUser"))?.company
        ?.id;
      (
        await this.companyService.postEntity(
          organisationObj,
          companyId,
          "organisationDetails"
        )
      ).subscribe(async (res: any) => {
        this.organisationData = res;
        if (this.file) {
          this.postAttachedFiles(companyId);
        } else {
          this.router.navigate(["/"]);
        }
      });
    }
  }

  uploadLogo(event: any) {
    // Reset fileError and image when a new file is selected
    this.fileError = null;
    this.image = null;

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (!ImageExtensions.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, wabp).";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = "File size exceeds 5MB limit.";
        return;
      }

      // If file passes all checks, set fileExtensionError to false
      this.fileExtensionError = false;

      // Read the file and display it as image preview
      const reader = new FileReader();
      reader.onload = (e) => (this.image = reader.result);
      reader.readAsDataURL(file);

      // Set the file to class variable
      this.file = file;
    }
  }

  async postAttachedFiles(id) {
    (await this.companyService.postImage(this.file, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.organisationForm.reset();
          this.router.navigate(["/"]);
        }
      }
    );
  }

  async getIndustryTypeList() {
    (await this.industryService.getIndustry()).subscribe((res: any[]) => {
      this.industryTypeDate = res;
    });
  }

  goBack() {
    this.router.navigate(["/"]);
  }

  // On selecting country
  onCountryChange(): void {
    this.states = State.getStatesOfCountry("IN");
  }

  // On selecting state
  onStateChange(state): void {
    this.cities = City.getCitiesOfState("IN", state?.isoCode);
    this.selectedState = state;
    this.organisationForm.get("state").setValue(state);
  }

  // On selecting city
  onCityChange(city): void {
    (this.selectedCity = city),
      this.organisationForm.get("city").setValue(city);
  }

  // Comparing selected state
  compareState(item, selected) {
    return item.name == selected.name;
  }

  // Comparing selected city
  compareCity(item, selected) {
    return item.name == selected.name;
  }

   // Toggle between view and edit modes
   toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
}
