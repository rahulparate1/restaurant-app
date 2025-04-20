import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralConfigurationService } from "../../general-configuration.service";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city"; // Import country-state-city

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-create-work-location",
  templateUrl: "./create-work-location.component.html",
  styleUrls: ["./create-work-location.component.css"],
})
export class CreateWorkLocationComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  workLocationForm: FormGroup;
  id: any;
  workLocationData: any;
  //Variables to fetch states and cities
  cities: any;
  states: any;
  selectedState: any;
  selectedCity: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private generalConfigService: GeneralConfigurationService
  ) {
    this.onCountryChange();
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Work Location" },
      { label: "Add Work Location", active: true },
    ];

    // Set country to India by default
    this.workLocationForm = this.fb.group({
      workLocationName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ["", [Validators.required]],
      address1: ["", [Validators.required]],
      address2: ["", [Validators.required]],
      country: ["India", [Validators.required]], // Default set to India
      state: ["", [Validators.required]],
      city: ["", [Validators.required]],
      pincode: [
        "",
        [Validators.required, Validators.pattern("^[1-9][0-9]{5}$")],
      ],
    });

    if (this.id) {
      this.patchWorkLocationById(this.id);
    }
  }

  async patchWorkLocationById(id) {
    (await this.generalConfigService.getWorkLocationbyId(id)).subscribe(
      (res) => {
        this.workLocationData = res;
        this.workLocationForm.patchValue(this.workLocationData);
      }
    );
  }

  // On selecting country
  onCountryChange(): void {
    this.states = State.getStatesOfCountry("IN");
  }

  // On selecting state
  onStateChange(state): void {
    this.cities = City.getCitiesOfState("IN", state?.isoCode);
    this.selectedState = state;
    this.workLocationForm.get("state").setValue(state);
  }

  // On selecting city
  onCityChange(city): void {
    (this.selectedCity = city), this.workLocationForm.get("city").setValue(city);
  }

  // Comparing selected state
  compareState(item, selected) {
    return item.name == selected.name;
  }

  // Comparing selected city
  compareCity(item, selected) {
    return item.name == selected.name;
  }

  onSubmit() {
    if (this.workLocationForm.invalid) {
      return;
    }

    const workLocationData = this.workLocationForm.value;

    const workLocationObj = {
      workLocationName: workLocationData.workLocationName,
      description: workLocationData.description,
      address1: workLocationData.address1,
      address2: workLocationData.address2,
      country: workLocationData.country,
      state: workLocationData.state,
      city: workLocationData.city,
      pincode: workLocationData.pincode,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the work location?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.updateWorkLocation(
                this.id,
                workLocationObj
              )
            ).subscribe(() => {
              this.router.navigate([
                "/general-configuration/work-location-list",
              ]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the work location?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.generalConfigService.postWorkLocation(workLocationObj)
            ).subscribe(() => {
              this.router.navigate([
                "/general-configuration/work-location-list",
              ]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/general-configuration/work-location-list"]);
  }
}
