import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SupportTypeService } from '../support-type.service';
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-secondary ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});
@Component({
  selector: 'app-support-form',
  templateUrl: './support-form.component.html',
  styleUrls: ['./support-form.component.css']
})
export class SupportFormComponent {
  breadCrumbItems: Array<{}>;
  supportForm: FormGroup;
  id: any;
  file: any;
  supportResp: any;
  employeeData: any[];
  supportsType: string[];
  fileError: any;


   constructor(
      private formBuilder: FormBuilder,
      private service: SupportTypeService,
      private router: Router,
      private activeRoute: ActivatedRoute,
      private apiService: ApiService
    ) {
        // Initialize your form with FormControls
        this.supportForm = this.formBuilder.group({
          title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
          description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
        });
      }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "support type" },
      { label: "support type list", active: true },
    ];
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.getFormData(this.id);
    }
    this.getEmployeeListData();
  }

  async getFormData(id) {
    (await this.service.getSupportById(id)).subscribe((res) => {
      this.supportForm.patchValue({
        title: res.title,
        description: res.description,
      });
    });
  }

  navigateToList() {
    this.router.navigate(['/support-type/list-type']);
  }

  onFormSubmit() {
    let supportObj: any = {};
    supportObj.title = this.supportForm.value.title;
    supportObj.description = this.supportForm.value.description;
    if (this.supportForm.status != 'INVALID') {
      if (this.id) {
        swalWithBootstrapButtons
          .fire({
            title: 'Are you sure you want to update the details?',
            icon: 'success',
            confirmButtonText: 'Yes, Update!',
            cancelButtonText: 'No, Cancel!',
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (await this.service.updateSupport(this.id, supportObj)).subscribe(
                (res: any) => {
                  if (this.file) {
                    this.postAttachedFiles(this.id);
                  }
                  this.router.navigate(['support-type/list-type']);
                }
              );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      } else {
        swalWithBootstrapButtons
          .fire({
            title: 'Are you sure you want to add?',
            icon: 'success',
            confirmButtonText: 'Yes, Add!',
            cancelButtonText: 'No, Cancel!',
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              (await this.service.postSupport(supportObj)).subscribe(
                async (res: any) => {
                  if (this.file) {
                    this.postAttachedFiles(res.id);
                  }
                  this.router.navigate(['support-type/list-type']);
                }
              );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
          });
      }
    }
  }

  async getEmployeeListData() {
    (await this.service.getSupportListAll()).subscribe({
      next: (response: any) => {
        const employeeData: any[] = response;
        if (employeeData && employeeData.length > 0) {
          this.employeeData = employeeData.sort((a, b) =>
            a.basicDetails?.firstName.localeCompare(b.basicDetails?.firstName)
          );
        }
      },
      error: (error) => {
        console.error('Error retrieving employee data:', error);
      },
    });
  }

  async postAttachedFiles(id) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.supportForm.reset();
        this.router.navigate(['/support-type/list-type']);
      }
    });
  }
}