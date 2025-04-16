import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NonVegCategoryService } from '../non-veg-category.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-secondary ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent {
  nonVegForm!: FormGroup;
  id: any;
  nonvegData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private nonVegService: NonVegCategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    // Initialize the form
    this.nonVegForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      code: ['', Validators.required],
      description: ['', [Validators.required]],
    });

    if (this.id) {
      this.patchVegById(this.id);
    }
  }
  // Getter for form controls
  get form() {
    return this.nonVegForm.controls;
  }

  // Fetchcnon non veg category data by id for editing

  async patchVegById(id: any) {
    let url = 'http://127.0.0.1:3000/non-veg-categories/' + id;
    (await this.nonVegService.getCategoryById(url)).subscribe((res) => {
      this.nonvegData = res;
      this.nonVegForm.patchValue(this.nonvegData);
    });
  }

  // Submit the form
  onSubmit() {
    if (this.nonVegForm.invalid) {
      return;
    }

    const nonvegData = this.nonVegForm.value;
    const nonvegObj = {
      title: nonvegData.title,
      code: nonvegData.code,
      description: nonvegData.description,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: 'Are you sure you want to update the non-veg category?',
          confirmButtonText: 'Yes, Update!',
          cancelButtonText: 'No, Cancel!',
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/non-veg-categories/' + this.id;
            (await this.nonVegService.updateCategory(url, nonvegObj)).subscribe(
              () => {
                this.router.navigate(['/non-veg-category/list']);
              }
            );
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: 'Are you sure you want to add the non-veg category?',
          confirmButtonText: 'Yes, Add!',
          cancelButtonText: 'No, Cancel!',
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/non-veg-categories';
            (await this.nonVegService.createCategory(url, nonvegObj)).subscribe(
              () => {
                this.router.navigate(['/non-veg-category/list']);
              }
            );
          }
        });
    }
  }
}
