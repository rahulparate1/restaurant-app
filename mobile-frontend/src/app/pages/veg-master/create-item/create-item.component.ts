import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { VegCategoryService } from '../../veg-category/veg-category.service';
import { VegMasterService } from '../veg-master.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss']
})
export class CreateItemComponent {

  vegItemForm!: FormGroup;
  id: any;
  itemData: any;
  categoryList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private itemService: VegMasterService,
    private categoryService: VegCategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");

    this.vegItemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      categoryId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required],
      status: ['available', Validators.required],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      discount: ['', [Validators.min(0), Validators.max(100)]],
    });

    this.fetchCategoryList();

    if (this.id) {
      this.patchItemById(this.id);
    }
  }

  get form() {
    return this.vegItemForm.controls;
  }

  fetchCategoryList() {
    let url = 'http://127.0.0.1:3000/veg-categories'; // API endpoint to fetch categories
    this.categoryService.getAllCategories(url).subscribe(
      (res: any) => {
        if (res) {
          this.categoryList = res; // Assigning the response to categoryList
        } else {
          console.error('Error fetching category data:', res);
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

 // Optional: To handle category change
 onCategoryChange(event: any) {
  const selectedCategoryId = event.target.value;
  console.log('Selected Category ID:', selectedCategoryId);
}

  async patchItemById(id: any) {
    let url = 'http://127.0.0.1:3000/vegs/' + id;
    (await this.itemService.getItemById(url)).subscribe((res) => {
      this.itemData = res;
      this.vegItemForm.patchValue(this.itemData);
    });
  }

  onSubmit() {
    if (this.vegItemForm.invalid) {
      return;
    }

    const itemData = this.vegItemForm.value;

    const itemObj = {
      name: itemData.name,
      categoryId: itemData.categoryId,
      price: itemData.price,
      date: itemData.date,
      image: itemData.image,
      description: itemData.description,
      status: itemData.status,
      rating: itemData.rating,
      discount: itemData.discount,
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update this item?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/vegs/' + this.id;
            (await this.itemService.updateItem(url, itemObj)).subscribe(() => {
              this.router.navigate(['/dashboard/veg-master/list']);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add this item?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            let url = 'http://127.0.0.1:3000/vegs';
            (await this.itemService.createItem(url, itemObj)).subscribe(() => {
              this.router.navigate(['/dashboard/veg-master/list']);
            });
          }
        });
    }
  }
}
