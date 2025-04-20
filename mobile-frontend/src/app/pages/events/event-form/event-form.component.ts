import { Component, OnInit } from "@angular/core";
import { EventServiceService } from "../event-service.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import Swal from "sweetalert2";
// import { ImageExtensions } from 'full/shared/constant';
import { eventType, ImageExtensions } from "../../../layouts/shared/constant";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic"; // Import CKEditor build

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-event-form",
  templateUrl: "./event-form.component.html",
  styleUrls: ["./event-form.component.css"],
})
export class EventFormComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  eventForm: FormGroup;
  id: any;
  user: any;
  employeeId: any;
  employeeName: any;
  employeeImage: any;
  employeeEmail: any;
  userId: any;
  companyId: any;
  employeeData: any;
  eventData: any;
  eventType: any = eventType;
  Editor = ClassicEditor; // Initialize Editor
  eventResp: any;

  today: string;

  isOnline: boolean = false; // Tracks if "Online" is selected
  isOffline: boolean = false; // Tracks if "Offline" is selected

  // image upload variables
  file: any;
  image: string | ArrayBuffer;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileError: any;

  descriptionTooShort = false;
  descriptionTooLong = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private eventService: EventServiceService
  ) {
    this.companyId = JSON.parse(
      localStorage.getItem("payoutUser")
    )?.company?.id;
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
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
      { label: "Events" },
      { label: "Add Event", active: true },
    ];
    this.eventForm = this.fb.group(
      {
        eventTitle: [
          "",
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(250),
          ],
        ],
        eventType: [null, [Validators.required]],
        description: [
          "",
          [
            Validators.required
          ],
        ],
        startDate: ["", [Validators.required]],
        endDate: ["", [Validators.required]],
        startTime: ["", [Validators.required]],
        endTime: ["", [Validators.required]],
        location: ["", [Validators.required]],
        meetingLink: [
          "",
          [
            Validators.pattern(
              /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
            ),
          ],
        ], // Optional initially
        address: [""], // Optional initially
      },
      { validators: this.dateTimeValidator }
    );

    if (this.id) {
      this.patchEventById(this.id);
    }
  }

  validateDescription(): void {
    const value = this.eventForm.get('description')?.value || '';
    const plainText = this.stripHtml(value).trim(); // Remove HTML tags and trim spaces

    this.descriptionTooShort = plainText.length > 0 && plainText.length < 10;
    this.descriptionTooLong = plainText.length > 1000;
  }

  private stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
  }
  dateTimeValidator(form: AbstractControl): null | object {
    const startDate = form.get("startDate")?.value;
    const endDate = form.get("endDate")?.value;
    const startTime = form.get("startTime")?.value;
    const endTime = form.get("endTime")?.value;

    let hasErrors = false;

    // Ensure endDate is not selected before startDate
    if (!startDate && endDate) {
      form.get("endDate")?.setErrors({ startDateRequired: true });
      hasErrors = true;
    } else if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      form.get("endDate")?.setErrors({ invalidDate: true });
      hasErrors = true;
    } else {
      form.get("endDate")?.setErrors(null);
    }

    // Ensure endTime is not before or equal to startTime on the same day
    if (startDate && endDate && startTime && endTime && startDate === endDate) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        form.get("endTime")?.setErrors({ invalidTime: true });
        hasErrors = true;
      } else {
        form.get("endTime")?.setErrors(null);
      }
    }

    return hasErrors ? { invalidDateTime: true } : null;
}


  // dateTimeValidator(form: AbstractControl): null | object {
  //   const startDate = form.get("startDate")?.value;
  //   const endDate = form.get("endDate")?.value;
  //   const startTime = form.get("startTime")?.value;
  //   const endTime = form.get("endTime")?.value;

  //   let hasErrors = false;
  //   // Check if endDate is before startDate
  //   if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
  //     form.get("endDate")?.setErrors({
  //       ...form.get("endDate")?.errors,
  //       invalidDate: true,
  //     });
  //     hasErrors = true;
  //   } else if (form.get("endDate")?.hasError("invalidDate")) {
  //     // Remove the invalidDate error if the condition no longer applies
  //     const errors = { ...form.get("endDate")?.errors };
  //     delete errors.invalidDate;
  //     form
  //       .get("endDate")
  //       ?.setErrors(Object.keys(errors).length ? errors : null);
  //   }

  //   // Check if endTime is before startTime on the same date
  //   if (startDate && endDate && startDate === endDate && startTime && endTime) {
  //     const startDateTime = new Date(`${startDate}T${startTime}`);
  //     const endDateTime = new Date(`${endDate}T${endTime}`);

  //     if (endDateTime < startDateTime) {
  //       form.get("endTime")?.setErrors({
  //         ...form.get("endTime")?.errors,
  //         invalidTime: true,
  //       });
  //       hasErrors = true;
  //     } else if (form.get("endTime")?.hasError("invalidTime")) {
  //       // Remove the invalidTime error if the condition no longer applies
  //       const errors = { ...form.get("endTime")?.errors };
  //       delete errors.invalidTime;
  //       form
  //         .get("endTime")
  //         ?.setErrors(Object.keys(errors).length ? errors : null);
  //     }
  //   }
  //   return hasErrors ? { invalidDateTime: true } : null;
  // }

  async patchEventById(id: string) {
    (await this.eventService.getEventbyId(id)).subscribe((res) => {
      this.eventData = res;
      this.eventForm.patchValue(this.eventData); // Patch the form with the data

      // Reset location-related states
      this.isOnline = false;
      this.isOffline = false;

      // Set isOnline/isOffline based on existing location
      if (this.eventData?.location === "online") {
        this.isOnline = true;
        this.eventForm.get("meetingLink")?.setValidators([
          // Apply online-specific validators
          Validators.required,
          Validators.pattern(
            /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
          ), // Pattern validator
        ]);
        this.eventForm.get("address")?.clearValidators(); // Clear address validators for online
      } else if (this.eventData?.location === "offline") {
        this.isOffline = true;
        this.eventForm.get("address")?.setValidators(Validators.required); // Apply offline-specific validators
        this.eventForm.get("meetingLink")?.clearValidators(); // Clear meeting link validators for offline
      }

      // Apply the correct validators after patching the form
      this.eventForm.get("meetingLink")?.updateValueAndValidity();
      this.eventForm.get("address")?.updateValueAndValidity();

      // Handle image patching
      if (this.eventData?.image) {
        this.image = this.eventData?.image; // Assign the image URL to the image variable for preview
      } else {
        this.image = null; // Clear the image if none exists
      }
    });
  }

  onLocationChange(event: Event): void {
    const selectedLocation = (event.target as HTMLSelectElement).value;

    // Reset both fields initially
    this.isOnline = false;
    this.isOffline = false;
    this.eventForm.get("meetingLink")?.clearValidators();
    this.eventForm.get("address")?.clearValidators();

    if (selectedLocation === "online") {
      this.isOnline = true;
      this.eventForm.get("meetingLink")?.setValidators([
        // Apply online-specific validators
        Validators.required,
        Validators.pattern(
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
        ), // Pattern validator
      ]);
      this.eventForm.get("address")?.clearValidators(); // Clear address validators for online
    } else if (selectedLocation === "offline") {
      this.isOffline = true;
      this.eventForm.get("address")?.setValidators(Validators.required); // Apply offline-specific validators
      this.eventForm.get("meetingLink")?.clearValidators(); // Clear meeting link validators for offline
    }

    // Apply the correct validators after location change
    this.eventForm.get("meetingLink")?.updateValueAndValidity();
    this.eventForm.get("address")?.updateValueAndValidity();
  }

  onSubmit(): void {
    let eventObj: any = {};
    eventObj.eventTitle = this.eventForm.value.eventTitle;
    eventObj.description = this.eventForm.value.description;
    eventObj.eventType = this.eventForm.value.eventType;
    eventObj.startDate = this.eventForm.value.startDate;
    eventObj.endDate = this.eventForm.value.endDate;
    eventObj.location = this.eventForm.value.location;
    eventObj.meetingLink = this.eventForm.value.meetingLink;
    eventObj.address = this.eventForm.value.address;
    eventObj.startTime = this.eventForm.value.startTime;
    eventObj.endTime = this.eventForm.value.endTime;
    eventObj.userId = this.userId;
    // eventObj.employeeId = this.employeeId;
    eventObj.employee = {
      id: this.employeeId,
      name: this.employeeName,
      image: this.employeeImage, // Assuming employeeName is a variable holding the employee's name
      email: this.employeeEmail,
    };
    eventObj.companyId = this.companyId;

    if (this.eventForm.status != "INVALID") {
      if (this.id) {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to update the details?",
            icon: "success",
            confirmButtonText: "Yes, Update!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (
                await this.eventService.updateEvent(this.id, eventObj)
              ).subscribe(async (res: any) => {
                if (this.file) {
                  this.postAttachedFiles(this.id);
                } else {
                  this.router.navigate(["/general-feed"]);
                }
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      } else {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to add?",
            icon: "warning",
            confirmButtonText: "Yes, Add!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (await this.eventService.postEvent(eventObj)).subscribe(
                async (res: any) => {
                  if (res) {
                    this.eventResp = res;
                    if (this.file) {
                      this.postAttachedFiles(this.eventResp?.id);
                    } else {
                      this.eventForm.reset();
                      this.router.navigate(["/general-feed"]);
                    }
                  }
                }
              );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      }
    }
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

  removeImage(): void {
    this.image = null;
    this.fileError = null;
    // Clear the file input
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  async postAttachedFiles(id) {
    (await this.eventService.postImage(this.file, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.eventForm.reset();
          this.router.navigate(["/general-feed"]);
        }
      }
    );
  }

  navigateToList(): void {
    this.router.navigate(["/event/event-form"]);
  }

  postCancel() {
    this.router.navigate(["/general-feed"]);
  }
}
