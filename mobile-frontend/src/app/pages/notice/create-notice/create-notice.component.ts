import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import Swal from "sweetalert2";
// import { ImageExtensions } from 'full/shared/constant';
import { ImageExtensions } from "../../../layouts/shared/constant";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic"; // Import CKEditor build
import { NoticeService } from "../notice.service";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-create-notice",
  templateUrl: "./create-notice.component.html",
  styleUrls: ["./create-notice.component.css"],
})
export class CreateNoticeComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  noticeForm: FormGroup;
  id: any;
  employeeId: any;
  employeeName: any;
  employeeImage: any;
  employeeEmail: any;
  userId: any;
  companyId: any;
  user: any;
  today: string;
  Editor = ClassicEditor; // Initialize Editor
  noticeResp: any;
  noticeData: any;
  workLocations = [];
  departments = [];

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
    private service: NoticeService
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
      { label: "Notices" },
      { label: "Create Notice", active: true },
    ];
    this.noticeForm = this.fb.group({
      noticeTitle: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(250),
        ],
      ],
      description: [
        "",
        [
          Validators.required
        ],
      ],
      workLocation: [null], // No Validators.required
      department: [null], // No Validators.required
    });

    // Fetch departments and work locations
    this.fetchDepartments()
      .then(() => {
        return this.fetchWorkLocations();
      })
      .then(() => {
        // Only call patchNoticeById after both fetches are complete
        if (this.id) {
          this.patchNoticeById(this.id);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }

  async fetchWorkLocations() {
    (await this.service.getWorkLocation()).subscribe(
      (res: any) => {
        // Assuming the API returns a list of all departments
        this.workLocations = res; // Store all departments
      },
      (err) => {
        console.error("Error fetching departments:", err);
      }
    );
  }

  async fetchDepartments() {
    (await this.service.getDepartment()).subscribe(
      (res: any) => {
        // Assuming the API returns a list of all departments
        this.departments = res; // Store all departments
      },
      (err) => {
        console.error("Error fetching departments:", err);
      }
    );
  }
  async patchNoticeById(id: string) {
    (await this.service.getNoticeById(id)).subscribe((res) => {
      this.noticeData = res;
      const workLocationId = this.noticeData?.workLocation?.id;
      const departmentId = this.noticeData?.department?.id;

      const selectedWorkLocation = this.workLocations.find(
        (loc) => loc.id === workLocationId // Ensure ID comparison is correct
      );
      const selectedDepartment = this.departments.find(
        (dept) => dept.id === departmentId // Ensure ID comparison is correct
      );

      // Patch form with the selected values
      this.noticeForm.patchValue({
        noticeTitle: this.noticeData?.noticeTitle || "",
        description: this.noticeData?.description || "",
        workLocation: selectedWorkLocation || null,
        department: selectedDepartment || null,
      });

      this.image = this.noticeData?.image || null;
    });
  }

  validateDescription(): void {
    const value = this.noticeForm.get('description')?.value || '';
    const plainText = this.stripHtml(value).trim(); // Remove HTML tags and trim spaces

    this.descriptionTooShort = plainText.length > 0 && plainText.length < 10;
    this.descriptionTooLong = plainText.length > 500;
  }

  private stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
  }

  onSubmit(): void {
    let noticeObj: any = {};
    noticeObj.noticeTitle = this.noticeForm.value.noticeTitle;
    noticeObj.description = this.noticeForm.value.description;
  const selectedWorkLocationId = this.noticeForm.value.workLocation;
  if (selectedWorkLocationId) {
    const selectedWorkLocation = this.workLocations.find(
      (loc) => loc.id === selectedWorkLocationId
    );
    if (selectedWorkLocation) {
      noticeObj.workLocation = {
        id: selectedWorkLocation.id,
        name: selectedWorkLocation.workLocationName,
      };
    }
  }

  // Find selected Department object from departments array
  const selectedDepartmentId = this.noticeForm.value.department;
  if (selectedDepartmentId) {
    const selectedDepartment = this.departments.find(
      (dept) => dept.id === selectedDepartmentId
    );
    if (selectedDepartment) {
      noticeObj.department = {
        id: selectedDepartment.id,
        name: selectedDepartment.departmentName,
      };
    }
  }
    // Set the current date and time
    noticeObj.noticeDate = new Date().toISOString();
    noticeObj.userId = this.userId;
    noticeObj.employee = {
      id: this.employeeId,
      name: this.employeeName,
      image: this.employeeImage,
      email: this.employeeEmail,
    };
    noticeObj.companyId = this.companyId;

    if (this.noticeForm.status != "INVALID") {
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
              (await this.service.updateNotice(this.id, noticeObj)).subscribe(
                async (res: any) => {
                  if (this.file) {
                    this.postAttachedFiles(this.id);
                  } else {
                    this.router.navigate(["/general-feed"]);
                  }
                }
              );
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
              (await this.service.postNotice(noticeObj)).subscribe(
                async (res: any) => {
                  if (res) {
                    this.noticeResp = res;
                    if (this.file) {
                      this.postAttachedFiles(this.noticeResp?.id);
                    } else {
                      this.noticeForm.reset();
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

  async postAttachedFiles(id) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.noticeForm.reset();
        this.router.navigate(["/general-feed"]);
      }
    });
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
          "Please upload an image with a valid extension (pdf, jpg, png, svg, jpeg, wabp).";
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
  postCancel() {
    this.router.navigate(["/general-feed"]);
  }
}
