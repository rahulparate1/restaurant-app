import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { reimbursementType } from "src/app/layouts/full/shared/constant";
import Swal from "sweetalert2";
import { ReimbursementService } from "../reimbursement.service";
import { ImageExtensions } from "src/app/layouts/full/shared/constant";
import { ApiService } from "src/app/services/api.service";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});
@Component({
  selector: "app-add-reimbursement",
  templateUrl: "./add-reimbursement.component.html",
  styleUrls: ["./add-reimbursement.component.css"],
})
export class AddReimbursementComponent {
  breadCrumbItems: Array<{}>;
  maxAmount: number = 100000;
  myForm: FormGroup;
  id: any;
  file: any;
  reimbursementResp: any;
  reimbursementType: any[];
  ImageExtensions: string[];
  image: string | ArrayBuffer;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileError: any;
  status: number;
  isFormVisible: boolean = false;
  isLoading: boolean = false;
  extractFileData: any;

  constructor(
    private formBuilder: FormBuilder,
    private service: ReimbursementService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.myForm = this.formBuilder.group({
      title: new FormControl("", [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
      ]),
      amount: [
        "",
        [
          Validators.required,
          Validators.pattern(/^\d{2,6}$/),
          Validators.max(this.maxAmount),
          Validators.min(1),
        ],
      ],
      description: new FormControl("", [
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
      type: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Reimbursement" },
      { label: "form", active: true },
    ];
    this.reimbursementType = reimbursementType;
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    if (this.id) {
      this.getFormData(this.id);
    }
  }

  async getFormData(id) {
    this.apiService.startLoader();
    (await this.service.getReimbursementByIdInclude(id)).subscribe((res) => {
      this.apiService.stopLoader();
      this.myForm.patchValue({
        title: res.title,
        amount: res.amount,
        description: res.description,
        image: res.image,
        type: res.type,
      });
      this.image = res?.data?.image;
      this.status = res.status;
    });
  }

  navigateToList() {
    this.router.navigate(["/reimbursement/list"]);
  }

  onFormSubmit() {
    let reimbursementObj: any = {};
    reimbursementObj.title = this.myForm.value.title.trim();
    reimbursementObj.amount = this.myForm.value.amount;
    reimbursementObj.description = this.myForm.value.description;
    reimbursementObj.type = this.myForm.value.type;
    reimbursementObj.status = 3;
    // Set the current date
    reimbursementObj.date = new Date().toISOString();
    if (this.myForm.status != "INVALID") {
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
            this.apiService.startLoader();
            if (result.value) {
              (
                await this.service.updateReimbursements(
                  this.id,
                  reimbursementObj
                )
              ).subscribe((res: any) => {
                if (this.file) {
                  this.postAttachedFiles(this.id);
                }
                this.router.navigate(["reimbursement/list"]);
                this.apiService.stopLoader();
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      } else {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to add?",
            icon: "success",
            confirmButtonText: "Yes, Add!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            this.apiService.startLoader();
            if (result.value) {
              (
                await this.service.postReimbursements(reimbursementObj)
              ).subscribe(async (res: any) => {
                if (this.file) {
                  this.postAttachedFiles(res.id);
                }
                this.router.navigate(["reimbursement/list"]);
                this.apiService.stopLoader();
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      }
    }
  }

  uploadLogo(event: any) {
    this.fileError = null;
    this.image = null;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      if (!ImageExtensions.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, wabp, pdf).";
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

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  async postAttachedFiles(id) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.myForm.reset();
        this.router.navigate(["/reimbursement/list"]);
      }
    });
  }

  removeImage(): void {
    this.image = null;
    this.fileError = null;
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  editReimbursements(id: any) {
    this.router.navigate(["/reimbursement/form/" + id]);
  }

  async extractFile() {
    this.isLoading = true;

    // Assuming `this.service.getJson(this.file)` returns an Observable
    (await this.service.getJson(this.file)).subscribe(
      (res: any) => {
        this.extractFileData = res;
        // Check if extractFileData is valid
        if (this.extractFileData) {
          const title = this.extractFileData["Title"];
          const grandTotal = this.extractFileData["Total Amount"];
          const type = this.extractFileData["Type"];
          // const itemNameArray = this.extractFileData["Item Name"];
          const titleValue = Array.isArray(title)
            ? title.join(", ")
            : title || "";
          const typeValue = Array.isArray(type) ? type.join(", ") : type || "";
          // Update the form with the extracted data
          this.myForm.patchValue({
            title: titleValue,
            amount: grandTotal,
            type: typeValue,
            description: "",
          });
          this.isLoading = false;
        }
      },
      (error) => {
        console.error("Error extracting file data:", error);
        this.isLoading = false;
      }
    );
  }
}
