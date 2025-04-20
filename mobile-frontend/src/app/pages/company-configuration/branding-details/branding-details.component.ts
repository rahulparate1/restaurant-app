import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CompanyConfigurationService } from "../company-configuration.service";
import { GeneralConfigurationService } from "../../general-configuration/general-configuration.service";
import { ImageExtensions, rolesType } from "full/shared/constant";
import { Country, State, City } from "country-state-city";

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
  selector: 'app-branding-details',
  templateUrl: './branding-details.component.html',
  styleUrls: ['./branding-details.component.css']
})
export class BrandingDetailsComponent {

  breadCrumbItems: Array<{}>;
  brandingForm: FormGroup;
  organisationData: any;
  organisationCompanyData: any;
  user: any;
  companyId: any;
  status: string;
  file: any;
  fileMonogram: any;
  image;
  monogramLogo;
  industryTypeDate: any[];
  fileError: any;
  fileErrorMonogram: any
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


   designationForm: FormGroup;
   id: any;
   designationData: any;
  brandData: any;
  brandingRes: any;

   constructor(
     private router: Router,
     private fb: FormBuilder,
     private activeRoute: ActivatedRoute,
     private companyService: CompanyConfigurationService
   ) {}

   ngOnInit(): void {
     this.id = this.activeRoute.snapshot.paramMap.get("id");
     this.breadCrumbItems = [
       { label: "Designation" },
       { label: "Add Designation", active: true },
     ];

     this.brandingForm = this.fb.group({
       title: [
         "",
         [
           Validators.required,
           Validators.minLength(5),
           Validators.maxLength(50),
         ],
       ],
       copyright: ["", [Validators.required]],
     });
     if (this.id) {
       this.patchBrandingById(this.id);
     }
   }


   async patchBrandingById(id) {
    (await this.companyService.getBrandingbyId(id)).subscribe((res) => {
      this.brandingForm.patchValue({
        title: res.title,
        copyright: res.copyright,
      });
      this.image = res?.image,
      this.monogramLogo = res?.monogramLogo
    });
  }

   onSubmit() {
     if (this.brandingForm.invalid) {
       return;
     }

     const brandData = this.brandingForm.value;

     const brandingObj = {
       title: brandData.title,
       copyright: brandData.copyright,
     };

     if (this.id) {
       swalWithBootstrapButtons
         .fire({
           title: "Are you sure you want to update the designation?",
           confirmButtonText: "Yes, Update!",
           cancelButtonText: "No, Cancel!",
           showCancelButton: true,
         })
         .then(async (result) => {
           if (result.value) {
             (
               await this.companyService.updateBranding(
                 this.id,
                 brandingObj
               )
             ).subscribe(() => {
              this.postAttachedFiles(this.id);
              this.postAttachedFilesLogo(this.id);
               this.router.navigate(["/"]);
             });
           }
         });
     } else {
       swalWithBootstrapButtons
         .fire({
           title: "Are you sure you want to add the designation?",
           confirmButtonText: "Yes, Add!",
           cancelButtonText: "No, Cancel!",
           showCancelButton: true,
         })
         .then(async (result) => {
           if (result.value) {
             (
               await this.companyService.postBranding(brandingObj)
             ).subscribe((res) => {
              this.brandingRes = res;
              this.postAttachedFiles(this.brandingRes.id);
              this.postAttachedFilesLogo(this.brandingRes.id);
               this.router.navigate(["/"]);
             });
           }
         });
     }
   }

   navigateToList() {
     this.router.navigate(["/"]);
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

  uploadMonogramLogo(event: any) {
    // Reset fileError and image when a new file is selected
    this.fileErrorMonogram = null;
    this.monogramLogo = null;

    if (event.target.files.length > 0) {
      const fileMonogram = event.target.files[0];
      const fileNameMonogram = fileMonogram.name;
      const fileExtensionMonogram = fileNameMonogram.split(".").pop()?.toLowerCase();

      if (!ImageExtensions.includes(fileExtensionMonogram)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, wabp).";
        return;
      }
      if (fileMonogram.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = "File size exceeds 5MB limit.";
        return;
      }

      // If file passes all checks, set fileExtensionError to false
      this.fileExtensionError = false;

      // Read the file and display it as image preview
      const reader = new FileReader();
      reader.onload = (e) => (this.monogramLogo = reader.result);
      reader.readAsDataURL(fileMonogram);

      // Set the file to class variable
      this.fileMonogram = fileMonogram;
    }
  }

  async postAttachedFiles(id) {
    (await this.companyService.postBrandingImage(this.file, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.brandingForm.reset();
          this.router.navigate(["/"]);
        }
      }
    );
  }

  async postAttachedFilesLogo(id) {
    (await this.companyService.postBrandingImageLogo(this.fileMonogram, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.brandingForm.reset();
          this.router.navigate(["/"]);
        }
      }
    );
  }

  goBack() {
    this.router.navigate(["/"]);
  }

}
