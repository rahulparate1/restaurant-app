import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VegCategoryService } from '../veg-category.service';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-form-category',
  templateUrl: './form-category.component.html',
  styleUrls: ['./form-category.component.scss']
})
export class FormCategoryComponent {

  vegForm!: FormGroup;
  id: any;
  vegData: any;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private vegService: VegCategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");

    // Initialize the form
    this.vegForm = this.fb.group({
      title: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      code: ['', Validators.required],
      description: ["", [Validators.required]],
    });

    if (this.id) {
      this.patchVegById(this.id);
    }
  }
  // Getter for form controls
  get form() {
    return this.vegForm.controls;
  }

  // Fetch veg category data by id for editing

  async patchVegById(id: any) {
    let url = 'http://127.0.0.1:3000/veg-categories/' + id;
    (await this.vegService.getCategoryById(url)).subscribe(
      (res) => {
        this.vegData = res;
        this.vegForm.patchValue(this.vegData);
      }
    );
  }

  // Submit the form
  onSubmit() {
    if (this.vegForm.invalid) {
      return;
    }

    const vegData = this.vegForm.value;
    const vegObj = {
      title: vegData.title,
      code: vegData.code,
      description: vegData.description,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the veg category?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/veg-categories/'+ this.id;
            (await this.vegService.updateCategory(url, vegObj))
              .subscribe(() => {
                this.router.navigate(["/veg-category/list"]);
              });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the veg category?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/veg-categories';
            (await this.vegService.createCategory(url, vegObj)).subscribe(() => {
              this.router.navigate(["/veg-category/list"]);
            });
          }
        });
    }
  }
}
