import { Component } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import Swal from "sweetalert2";
import { PollsService } from "../polls.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ImageExtensions } from "src/app/layouts/shared/constant";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-create-polls",
  templateUrl: "./create-polls.component.html",
  styleUrls: ["./create-polls.component.css"],
})
export class CreatePollsComponent {
  breadCrumbItems: Array<{}>;
  pollsForm: UntypedFormGroup;
  file: any;
  form: FormGroup;

  id: string;
  employeeId: any;
  employeeName: any;
  employeeImage: any;
  employeeEmail: any;
  userId: any;

  pollsData: any;
  image: any;
  pollsResp: any;
  user: any;
  designation: any;
  fileError: any;
  fileExtensionError: boolean;
  isSubmitted = false;
  hidden: boolean;
  endDateError: string;
  today: string;

  constructor(
    private formBuilder: FormBuilder,
    private service: PollsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser") || "{}");
    this.userId = this.user?.user?.id;
    this.employeeId = this.user?.employee?.id;
    this.employeeName = this.user?.user?.name;
    this.employeeImage = this.user?.employee?.basicDetails?.image;
    this.employeeEmail = this.user?.employee?.basicDetails?.email;
    this.today = new Date().toISOString().split("T")[0];
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Polls" },
      { label: "Polls List", active: true },
    ];

    if (this.id) {
      this.getPolls(this.id);
    }
    this.createForm();

    // Set today's date and time in the required format (yyyy-MM-ddThh:mm)
    const now = new Date();
    this.today = now.toISOString().slice(0, 16); // Extracts yyyy-MM-ddThh:mm
  }

  createForm() {
    this.pollsForm = this.formBuilder.group({
      title: ["", [Validators.required]],
      description: ["", [Validators.required]],
      startDateTime: ["", [Validators.required]],
      endDateTime: ["", [Validators.required]],
      options: this.formBuilder.array([], [this.minOptionsValidator]),
      // options: this.formBuilder.array([]),
    });
  }

  private minOptionsValidator(formArray: FormArray): { [key: string]: boolean } | null {
    const validOptions = formArray.controls.filter(
      (control) => control.get('option')?.value?.trim() // Check if the option is not empty
    );
    return validOptions.length >= 2 ? null : { minOptions: true };
  }

  validateEndDate() {
    const startDateTimeControl = this.pollsForm.get("startDateTime");
    const endDateTimeControl = this.pollsForm.get("endDateTime");

    const startDateTime = startDateTimeControl?.value;
    const endDateTime = endDateTimeControl?.value;

    if (startDateTime && endDateTime) {
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        this.endDateError = "End Date and Time must be greater than Start Date and Time";
        endDateTimeControl?.setErrors({ invalidEndDate: true });
      } else {
        this.endDateError = null;
        endDateTimeControl?.setErrors(null);
      }
    }

    // Ensure endDateTime always has the correct min value
    if (startDateTime) {
      endDateTimeControl?.setValidators([
        Validators.required,
        (control: AbstractControl) => {
          return control.value && new Date(control.value) <= new Date(startDateTime)
            ? { invalidEndDate: true }
            : null;
        },
      ]);
      endDateTimeControl?.updateValueAndValidity();
    }

    // If endDateTime was entered first, revalidate startDateTime
    if (endDateTime) {
      startDateTimeControl?.updateValueAndValidity();
    }
  }

  createOption(): FormGroup {
    return this.formBuilder.group({
      option: ["", Validators.required],
    });
  }

  get optionsFormArray(): FormArray {
    return this.pollsForm.get("options") as FormArray;
  }

  // addOption(): void {
  //   this.optionsFormArray.push(this.createOption());
  // }
  addOption(): void {
    this.optionsFormArray.push(this.formBuilder.group({ option: ['', Validators.required] }));
  }
  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  async getPolls(id: string) {
    try {
      (await this.service.getPollsdById(id)).subscribe(
        (res) => {
          this.pollsData = res;
          // Patch basic form fields
          this.pollsForm.patchValue({
            title: this.pollsData.title,
            description: this.pollsData.description,
            startDateTime: this.pollsData.startDateTime,
            endDateTime: this.pollsData.endDateTime,
          });

          // Handle options
          if (Array.isArray(this.pollsData.options)) {
            const optionsArray = this.pollsData.options.map(
              (opt: { option: string }) =>
                this.formBuilder.group({
                  option: [opt.option, Validators.required],
                })
            );

            const optionsFormArray = this.pollsForm.get("options") as FormArray;
            optionsFormArray.clear();
            optionsArray.forEach((optionGroup) =>
              optionsFormArray.push(optionGroup)
            );
          } else {
            console.error("Invalid options structure:", this.pollsData.options);
          }

          // Handle image
          if (this.pollsData.image) {
            this.image = this.pollsData.image;
          }
        },
        (error) => {
          console.error("Error fetching polls data:", error);
        }
      );
    } catch (error) {
      console.error("Error in getPolls method:", error);
    }
  }

  async postPollsData() {
    let pollsObj: any = {};
    pollsObj.title = this.pollsForm.value.title;
    pollsObj.description = this.pollsForm.value.description;
    pollsObj.startDateTime = this.pollsForm.value.startDateTime;
    pollsObj.endDateTime = this.pollsForm.value.endDateTime;
    pollsObj.employee = {
      id: this.employeeId,
      name: this.employeeName,
      image: this.employeeImage,
      email: this.employeeEmail,
    };
    pollsObj.options = this.pollsForm
      .get("options")
      ?.value.map((option: any) => ({
        option: option.option,
      }));
    if (this.pollsForm.valid) {
      if (this.id) {
        swalWithBootstrapButtons.fire({
          title: "Are you sure you want to update?",
          icon: "success",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        }).then(async (result) => {
          if (result.value) {
            (await this.service.updatePolls(this.id, pollsObj)).subscribe(
              (res: any) => {
                if (this.file) {
                  this.postAttachedFiles(this.id);
                } else {
                  this.router.navigate(["/general-feed"]);
                }
              },
              (error) => {
                console.error("Error updating poll:", error);
              }
            );
          }
        });
      } else {
        swalWithBootstrapButtons.fire({
          title: "Are you sure you want to add?",
          icon: "warning",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        }).then(async (result) => {
          if (result.value) {
            (await this.service.postPolls(pollsObj)).subscribe(
              (res: any) => {
                if (res) {
                  this.pollsResp = res;
                  if (this.file) {
                    this.postAttachedFiles(this.pollsResp.id);
                    this.pollsForm.reset();
                  } else {
                    this.pollsForm.reset();
                    this.router.navigate(["/general-feed"]);
                  }
                }
              },
              (error) => {
                console.error("Error adding poll:", error);
              }
            );
          }
        });
      }
    }
  }

  postCancel() {
    this.router.navigate(["/general-feed"]);
  }

  uploadLogo(event: any) {
    this.fileError = null;
    this.image = null;
    this.file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => (this.image = reader.result);
    reader.readAsDataURL(this.file);

    // Reset fileError and image when a new file is selected

    if (event?.target?.files?.length > 0) {
      const file = event?.target?.files[0];
      const fileName = file?.name;
      const fileExtension = fileName?.split(".").pop()?.toLowerCase();

      if (!ImageExtensions.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, wabp).";
        return;
      }
      if (file?.size > 5 * 1024 * 1024) {
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
  async postAttachedFiles(id: string) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.pollsForm.reset();
        this.router.navigate(["/general-feed"]);
      }
    });
  }
}
