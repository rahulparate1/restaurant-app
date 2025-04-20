import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../../employee-management.service";
import { ImageExtensions } from "src/app/layouts/shared/constant";
import { ShiftService } from "src/app/pages/shift/shift.service";
import { GeneralConfigurationService } from "src/app/pages/general-configuration/general-configuration.service";

// Custom Validator to ensure 3 digits
export function threeDigitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex = /^[0-9]{3}$/;
    return regex.test(control.value) ? null : { invalidEmployeeCode: true };
  };
}

@Component({
  selector: "app-basic-details",
  templateUrl: "./basic-details.component.html",
  styleUrls: ["./basic-details.component.css"],
})
export class BasicDetailsComponent {
  breadCrumbItems: Array<{}>;
  basicDetailsForm: UntypedFormGroup;
  basicDetailsData: any;
  basicDetailsById: any;
  designationList: any;
  departmentList: any;
  employeeListData: any;

  //for image variables
  image;
  file: any;
  fileError: any;
  ImageExtensions: any[];
  fileExtensionError: boolean;
  selectedFile: File | undefined;
  shiftList: any;
  workLocationListData: any;

  employeeId: string | null = null;
  cdkStepper: any;

  employeeCodeError: boolean = false;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private activeRoute: ActivatedRoute,
    private shiftService: ShiftService,
    private employeeService: EmployeeManagementService,
    private generalService : GeneralConfigurationService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Forms" },
      { label: "Form Wizard", active: true },
    ];

    this.basicDetailsForm = this.formBuilder.group({
      firstName: ["", [Validators.required]],
      middleName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      employeeType: ["", [Validators.required]],
      employeeCode: ["", [Validators.required, Validators.pattern("^[0-9]{3}$")],],
      dateOfJoining: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email],],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")],],
      gender: ["", [Validators.required]],
      designation: ["", [Validators.required]],
      department: ["", [Validators.required]],
      managerAssign: ["", [Validators.required]],
      shift: ["", [Validators.required]],
      workLocation: ["", [Validators.required]],
      isDirector: [false],
      image: [''],
    });
    this.getDesignationList();
    this.getEmployeeList();
    this.getDepartmentList();
    // this.patchBasicDetails();
    this.getShiftList();
    this.getWorkLocationList();
  }

  get form() {
    return this.basicDetailsForm.controls;
  }

  async onSubmit() {
    if (this.basicDetailsForm.status !== "INVALID") {
      let basicDetailsObj: any = {
        basicDetails: {
          firstName: this.basicDetailsForm.value.firstName,
          middleName: this.basicDetailsForm.value.middleName,
          lastName: this.basicDetailsForm.value.lastName,
          employeeCode: this.basicDetailsForm.value.employeeCode,
          dateOfJoining: this.basicDetailsForm.value.dateOfJoining,
          gender: this.basicDetailsForm.value.gender,
          employeeType: this.basicDetailsForm.value.employeeType,
          designation: this.basicDetailsForm.value.designation ? {
            id: this.basicDetailsForm.value.designation.id,
            title: this.basicDetailsForm.value.designation.title
          } : null,
          department: this.basicDetailsForm.value.department ? {
            id: this.basicDetailsForm.value.department.id,
            departmentName: this.basicDetailsForm.value.department.departmentName
          } : null,
          workLocation: this.basicDetailsForm.value.workLocation ? {
            id: this.basicDetailsForm.value.workLocation.id,
            workLocationName: this.basicDetailsForm.value.workLocation.workLocationName
          } : null,
          email: this.basicDetailsForm.value.email,
          mobileNo: this.basicDetailsForm.value.mobileNo,
          managerAssign: this.basicDetailsForm.value.managerAssign ? {
            id: this.basicDetailsForm.value.managerAssign.id,
            firstName: this.basicDetailsForm.value.managerAssign.firstName,
            lastName: this.basicDetailsForm.value.managerAssign.lastName
          } : null,
          shift: this.basicDetailsForm.value.shift ? {
            id: this.basicDetailsForm.value.shift.id,
            shiftName: this.basicDetailsForm.value.shift.shiftName,
            fromTime: this.basicDetailsForm.value.shift.fromTime,
            toTime: this.basicDetailsForm.value.shift.toTime
          } : null,
          isDirector: this.basicDetailsForm.value.isDirector,
        },
        status: "active",
      };

      // Remove the employeeId-related logic
      (await this.employeeService.postOverview(basicDetailsObj)).subscribe(
        async (res: any) => {
          this.basicDetailsData = res;
          this.employeeId = this.basicDetailsData.id;
          if (this.file) {
            this.postAttachedFiles(res.id);
          }
          let link = "/employee/employee/" + res?.id + "/" + "leave-details";
          window.location.href = window.location.origin + link;
        },
        (error: any) => {
          console.error("Error saving employee data:", error);
        }
      );
    }
  }

  getKeyValue(obj, key){
    let res: any = {}
    res.id = obj.id
    res[key] = obj[key]
    return JSON.stringify(res)
  }

  getKeyValueManager(obj){
    let res: any = {
      id: obj.id,
      firstName: obj.basicDetails.firstName,
      lastName: obj.basicDetails.lastName
    }
    return JSON.stringify(res)
  }

  getKeyValueShift(obj){
    let res: any = {
      id: obj.id,
      shiftName: obj.shiftName,
      toTime: obj.toTime
    }
    return JSON.stringify(res)
  }

  // Fetch the designation list
  async getDesignationList() {
    (await this.generalService.getDesignation()).subscribe(
      (res) => {
        this.designationList = res || [];
      },
      (error) => {
        console.error("Error fetching designation data", error);
      }
    );
  }

  // Fetch the department list
  async getDepartmentList() {
    (await this.generalService.getDepartment()).subscribe(
      (res) => {
        this.departmentList = res || [];
      },
      (error) => {
        console.error("Error fetching department data", error);
      }
    );
  }

  // Fetch the shift list
  async getShiftList() {
    (await this.shiftService.getShiftList()).subscribe(
      (res) => {
        this.shiftList = res || [];
      },
      (error) => {
        console.error("Error fetching shift data", error);
      }
    );
  }

  // Fetch the employee list
  async getEmployeeList() {
    (await this.employeeService.getEmployeeList()).subscribe(
      (res) => {
        this.employeeListData = res?.data || [];
      },
      (error) => {
        console.error("Error fetching employee data", error);
      }
    );
  }

   // Fetch the work location list
   async getWorkLocationList() {
    (await this.generalService.getWorkLocation()).subscribe(
      (res) => {
        this.workLocationListData = res || [];
      },
      (error) => {
        console.error("Error fetching worklocation data", error);
      }
    );
  }

  uploadLogo(event: any) {
    this.fileError = null;
    this.image = null;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      // Validate file extension
      if (!ImageExtensions.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          'Please upload an image with a valid extension (jpg, png, svg, jpeg, webp).';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = 'File size exceeds 5MB limit.';
        return;
      }

      // Display the image as preview
      const reader = new FileReader();
      reader.onload = (e) => (this.image = reader.result);
      reader.readAsDataURL(file);

      // Set file in class variable
      this.file = file;
    }
  }

  removeImage(): void {
    this.image = null;
    this.fileError = null;

    // Clear the file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async postAttachedFiles(id) {
    (await this.employeeService.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.basicDetailsForm.reset();
        this.router.navigate(['employee/list']);
      }
    });
  }

  async checkEmployeeCode(employeeCode: string) {
    this.employeeCodeError = false;  // Reset error on each check

    // Call the employeeService to verify the code
   (await this.employeeService.verifyEmployeeCode(employeeCode)).subscribe(
      (res) => {
        console.log(res); // Debugging: check what response we're getting from the backend
        if (res.exists) {
          this.employeeCodeError = true;  // Set error if the employee code exists
        } else {
          this.employeeCodeError = false; // No error
        }
      },
      (error) => {
        console.error('Error verifying employee code:', error);
        this.employeeCodeError = false; // Reset error in case of failure
      }
    );
  }
}
