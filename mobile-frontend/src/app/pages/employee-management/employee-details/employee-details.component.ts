import { Component } from "@angular/core";
import { EmployeeManagementService } from "../employee-management.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GeneralConfigurationService } from "../../general-configuration/general-configuration.service";
import { ShiftService } from "../../shift/shift.service";
import { bankNameList, ImageExtensions } from "full/shared/constant";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-employee-details",
  templateUrl: "./employee-details.component.html",
  styleUrls: ["./employee-details.component.css"],
})
export class EmployeeDetailsComponent {
  id: any;
  employeeDetails: any;
  basicDetailsData: Object;
  employeeTemp: any;
  updatedData: any;
  employeeTempData: any;
  editEmployeeForm: any = null;
  identityForm: FormGroup;
  editIdentityInfoForm: boolean = false;
  identityInfo: any = {};
  employeeId: string;
  workExperienceForm: FormGroup;
  editWorkExperienceForm: boolean = false;
  workExperience: any = {};
  educationDetailsForm: FormGroup;
  editEducationDetailsForm: boolean = false;
  educationDetails: any = {};
  bankDetailsForm: FormGroup;
  editBankDetailsForm: boolean = false;
  bankDetails: any = {};
  basicDetailsForm: FormGroup;
  editBasicDetailsForm: boolean = false;
  basicDetailsById: any;
  designationList: any;
  departmentList: any;
  employeeListData: any;
  workLocationListData: any;
  shiftList: any;
  basicInfo: any;

  //for image variables
  image;
  file: any;
  fileError: any;
  ImageExtensions: any[];
  fileExtensionError: boolean;
  selectedFile: File | undefined;
  bankName: any;

  constructor(
    private employeeService: EmployeeManagementService,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private router: Router,
    private generalService: GeneralConfigurationService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    if (this.id) {
      this.getEmployeeDetails(this.id);
    }
    this.bankName = bankNameList;
    this.getDesignationList();
    this.getEmployeeList();
    this.getDepartmentList();
    this.getShiftList();
    this.getWorkLocationList();
    this.initializeForm();
    this.patchIdentityInfo();
    this.patchWorkExperienceInfo();
    this.patchEducationDetails();
    this.patchBankDetails();
    this.patchBasicInfo();
    this.patchWorkExperienceInfo();
  }

  async getEmployeeDetails(id) {
    (await this.employeeService.getEmployeebyId(id)).subscribe((res: any[]) => {
      this.employeeDetails = res;
    });
  }

  initializeForm() {
    this.basicDetailsForm = this.fb.group({
      firstName: ["", [Validators.required]],
      middleName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      employeeType: ["", [Validators.required]],
      employeeCode: [
        "",
        [Validators.required, Validators.pattern("^[0-9]{3}$")],
      ],
      dateOfJoining: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      mobileNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      gender: ["", [Validators.required]],
      designation: ["", [Validators.required]],
      department: ["", [Validators.required]],
      managerAssign: ["", [Validators.required]],
      shift: ["", [Validators.required]],
      workLocation: ["", [Validators.required]],
      isDirector: [false],
      image: [""],
    });

    this.identityForm = this.fb.group({
      dob: ["", Validators.required],
      age: ["", [Validators.required, Validators.min(18)]],
      maritalStatus: ["", Validators.required],
      uan: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      pan: [
        "",
        [Validators.required, Validators.pattern(/[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      ],
      aadhar: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      presentAddress: ["", Validators.required],
      currentAddress: ["", Validators.required],
    });

    this.workExperienceForm = this.fb.group({
      companyName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      description: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]]
    });

    this.educationDetailsForm = this.fb.group({
      instituteName: ["", Validators.required],
      location: ["", Validators.required],
      degree: ["", Validators.required],
      specialization: ["", Validators.required],
      dateOfCompletion: ["", Validators.required],
      description: ["", Validators.required],
    });

    this.bankDetailsForm = this.fb.group({
      accountHolderName: ["", Validators.required],
      bankName: ["", Validators.required],
      ifscCode: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z]{4}[0][A-Z0-9a-z]{6}$/),
        ],
      ],
      accountNumber: [
        "",
        [Validators.required, Validators.pattern(/^\d{10,16}$/)],
      ],
      reAccountNumber: [
        "",
        [Validators.required, Validators.pattern(/^\d{10,16}$/)],
      ],
      accountType: ["", Validators.required],
    });
  }

  async patchBasicInfo() {
    this.employeeId = this.activeRoute.snapshot.paramMap.get("id");
    (await this.employeeService.getEmployeeDetails(this.employeeId)).subscribe(
      (data) => {
        this.basicInfo = data.basicDetails;
        this.basicDetailsForm.patchValue({
          firstName: this.basicInfo?.firstName || "",
          lastName: this.basicInfo?.lastName || "",
          mobileNo: this.basicInfo?.mobileNo || "",
          email: this.basicInfo?.email || "",
          designation: JSON.stringify(this.basicInfo?.designation) || "",
          middleName: this.basicInfo?.middleName || "",
          employeeCode: this.basicInfo?.employeeCode || "",
          managerAssign: JSON.stringify(this.basicInfo?.managerAssign) || "",
          dateOfJoining: this.basicInfo?.dateOfJoining || "",
          department: JSON.stringify(this.basicInfo?.department) || "",
          employeeType: this.basicInfo?.employeeType || "",
          workLocation: JSON.stringify(this.basicInfo?.workLocation) || "",
          shift: JSON.stringify(this.basicInfo?.shift) || "",
          gender: this.basicInfo?.gender || "",
          image: this.basicInfo?.image || "",
          isDirector: this.basicInfo?.isDirector || false,
        });
      }
    );
  }

  getKeyValue(obj, key) {
    let res: any = {};
    res.id = obj.id;
    res[key] = obj[key];
    return JSON.stringify(res);
  }

  getKeyValueManager(obj) {
    let res: any = {
      id: obj.id,
      firstName: obj.basicDetails.firstName,
      lastName: obj.basicDetails.lastName,
    };
    return JSON.stringify(res);
  }

  getKeyValueShift(obj) {
    let res: any = {
      id: obj.id,
      shiftName: obj.shiftName,
      toTime: obj.toTime,
    };
    return JSON.stringify(res);
  }
  get form() {
    return this.basicDetailsForm.controls;
  }

  async updateBasicDetails() {
    if (this.basicDetailsForm.invalid) {
      return;
    }

    const updatedData = {
      firstName: this.basicDetailsForm.value.firstName,
      middleName: this.basicDetailsForm.value.middleName,
      lastName: this.basicDetailsForm.value.lastName,
      employeeCode: this.basicDetailsForm.value.employeeCode,
      dateOfJoining: this.basicDetailsForm.value.dateOfJoining,
      gender: this.basicDetailsForm.value.gender,
      employeeType: this.basicDetailsForm.value.employeeType,
      designation: JSON.parse(this.basicDetailsForm.value.designation)
        ? {
            id: JSON.parse(this.basicDetailsForm.value.designation).id,
            title: JSON.parse(this.basicDetailsForm.value.designation).title,
          }
        : null,
      department: JSON.parse(this.basicDetailsForm.value.department)
        ? {
            id: JSON.parse(this.basicDetailsForm.value.department).id,
            departmentName: JSON.parse(this.basicDetailsForm.value.department)
              .departmentName,
          }
        : null,
      workLocation: JSON.parse(this.basicDetailsForm.value.workLocation)
        ? {
            id: JSON.parse(this.basicDetailsForm.value.workLocation).id,
            workLocationName: JSON.parse(
              this.basicDetailsForm.value.workLocation
            ).workLocationName,
          }
        : null,
      email: this.basicDetailsForm.value.email,
      mobileNo: this.basicDetailsForm.value.mobileNo,
      managerAssign: JSON.parse(this.basicDetailsForm.value.managerAssign)
        ? {
            id: JSON.parse(this.basicDetailsForm.value.managerAssign).id,
            firstName: JSON.parse(this.basicDetailsForm.value.managerAssign)
              .firstName,
            lastName: JSON.parse(this.basicDetailsForm.value.managerAssign)
              .lastName,
          }
        : null,
      shift: JSON.parse(this.basicDetailsForm.value.shift)
        ? {
            id: JSON.parse(this.basicDetailsForm.value.shift).id,
            shiftName: JSON.parse(this.basicDetailsForm.value.shift).shiftName,
            fromTime: JSON.parse(this.basicDetailsForm.value.shift).fromTime,
            toTime: JSON.parse(this.basicDetailsForm.value.shift).toTime,
          }
        : null,
      isDirector: this.basicDetailsForm.value.isDirector,
    };

    const employeeId = this.activeRoute.snapshot.paramMap.get("id");
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to update this?",
        confirmButtonText: "Yes, Update!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (
            await this.employeeService.dataPatch(employeeId, updatedData)
          ).subscribe(async (res) => {
            this.updatedData = res;
            this.modalService.dismissAll();
            if (this.file) {
              await this.postAttachedFiles(this.updatedData.id);
            }
          });
        }
      });
  }

  async patchIdentityInfo() {
    this.employeeId = this.activeRoute.snapshot.paramMap.get("id");
    (await this.employeeService.getEmployeeDetails(this.employeeId)).subscribe(
      (data) => {
        this.identityInfo = data.identityDetails;
        this.identityForm.patchValue({
          dob: this.identityInfo.dob,
          age: this.identityInfo.age,
          maritalStatus: this.identityInfo.maritalStatus,
          uan: this.identityInfo.uan,
          pan: this.identityInfo.pan,
          aadhar: this.identityInfo.aadhar,
          presentAddress: this.identityInfo.presentAddress,
          currentAddress: this.identityInfo.currentAddress,
        });
      }
    );
  }

  // Update identity information
  updateIdentityInfo() {
    if (this.identityForm.invalid) {
      return;
    }

    const updatedData = {
      identityDetails: this.identityForm.value,
    };

    Swal.fire({
      title: "Are you sure you want to update this?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        (
          await this.employeeService.additionalData(
            this.employeeId,
            updatedData
          )
        ).subscribe((response) => {
          Swal.fire(
            "Updated!",
            "Your identity information has been updated.",
            "success"
          );
          this.modalService.dismissAll();
        });
      }
    });
  }

  async patchWorkExperienceInfo() {
    this.employeeId = this.activeRoute.snapshot.paramMap.get("id");
   (await this.employeeService.getEmployeeDetails(this.employeeId)).subscribe(
      (response) => {
        this.workExperience = Array.isArray(response.workExperienceDetails)
          ? response.workExperienceDetails
          : [];
      },
      (error) => {
        // Handle any errors
        console.error('Error fetching employee details:', error);
      }
    );
  }

  addExperience(workExperienceDataModal: any) {
    this.modalService.open(workExperienceDataModal, {
      size: "xl",
      centered: true,
    });
  }

  async saveWorkExperience() {
    this.workExperience = this.workExperience || [];

    const newExperience = {
      companyName: this.workExperienceForm.get('companyName').value,
      jobTitle: this.workExperienceForm.get('jobTitle').value,
      fromDate: this.workExperienceForm.get('fromDate').value,
      toDate: this.workExperienceForm.get('toDate').value,
      description: this.workExperienceForm.get('description').value,
      experience: this.workExperienceForm.get('experience').value,
    };
    this.workExperience.push(newExperience);
    this.updateWorkExperience();
  }

  // Update the work experience list to the backend
  async updateWorkExperience() {
    const updatedData = {
      workExperienceDetails: this.workExperience
    };

    const employeeId = this.activeRoute.snapshot.paramMap.get('id');
    Swal.fire({
      title: "Are you sure you want to update this?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update!",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        (await this.employeeService.additionalData(employeeId, updatedData)).subscribe(
          (response) => {
            Swal.fire("Updated!", "Your work experience information has been updated.", "success");
            this.modalService.dismissAll();
          }

        );
      }
    });
  }

  async patchEducationDetails() {
    this.employeeId = this.activeRoute.snapshot.paramMap.get("id");
    (await this.employeeService.getEmployeeDetails(this.employeeId)).subscribe(
      (data) => {
        this.educationDetails = data.educationDetails;
        this.educationDetailsForm.patchValue({
          instituteName: this.educationDetails.instituteName,
          location: this.educationDetails.location,
          degree: this.educationDetails.degree,
          specialization: this.educationDetails.specialization,
          dateOfCompletion: this.educationDetails.dateOfCompletion,
          description: this.educationDetails.description,
        });
      }
    );
  }

  // Update education details
  async updateEducationDetails() {
    if (this.educationDetailsForm.invalid) {
      return;
    }

    const updatedData = {
      educationDetails: this.educationDetailsForm.value,
    };

    const employeeId = this.activeRoute.snapshot.paramMap.get("id");
    Swal.fire({
      title: "Are you sure you want to update this?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        (
          await this.employeeService.additionalData(employeeId, updatedData)
        ).subscribe((response) => {
          Swal.fire(
            "Updated!",
            "Your education details have been updated.",
            "success"
          );
          this.modalService.dismissAll();
        });
      }
    });
  }

  async patchBankDetails() {
    this.employeeId = this.activeRoute.snapshot.paramMap.get("id");
    (await this.employeeService.getEmployeeDetails(this.employeeId)).subscribe(
      (data) => {
        this.bankDetails = data.bankDetails;
        this.bankDetailsForm.patchValue({
          accountHolderName: this.bankDetails.accountHolderName,
          bankName: this.bankDetails.bankName,
          ifscCode: this.bankDetails.ifscCode,
          accountNumber: this.bankDetails.accountNumber,
          reAccountNumber: this.bankDetails.reAccountNumber,
          accountType: this.bankDetails.accountType,
        });
      }
    );
  }

  get bankForm() {
    return this.bankDetailsForm.controls;
  }

  // Update bank details
  async updateBankDetails() {
    if (this.bankDetailsForm.invalid) {
      return;
    }

    const updatedData = {
      bankDetails: this.bankDetailsForm.value,
    };

    const employeeId = this.activeRoute.snapshot.paramMap.get("id");
    Swal.fire({
      title: "Are you sure you want to update this?",
      showCancelButton: true,
      confirmButtonText: "Yes, Update!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        (
          await this.employeeService.additionalData(employeeId, updatedData)
        ).subscribe((response) => {
          Swal.fire(
            "Updated!",
            "Your bank details have been updated.",
            "success"
          );
          this.modalService.dismissAll();
        });
      }
    });
  }

  basicDetailsModal(basicDataModal: any) {
    this.modalService.open(basicDataModal, { size: "xl", centered: true });
  }

  identityModal(identityDataModal: any) {
    this.modalService.open(identityDataModal, { size: "xl", centered: true });
  }

  educationModal(educationDataModal: any) {
    this.modalService.open(educationDataModal, { size: "xl", centered: true });
  }

  bankModal(bankDataModal: any) {
    this.modalService.open(bankDataModal, { size: "xl", centered: true });
  }

  workExperienceModal(workExperienceDataModal: any) {
    this.modalService.open(workExperienceDataModal, {
      size: "xl",
      centered: true,
    });
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
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Validate file extension
      if (!ImageExtensions.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, webp).";
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = "File size exceeds 5MB limit.";
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

  async postAttachedFiles(id) {
    (await this.employeeService.postImage(this.file, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.basicDetailsForm.reset();
        }
      }
    );
  }
}
