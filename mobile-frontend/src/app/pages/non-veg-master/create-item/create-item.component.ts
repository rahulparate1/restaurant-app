import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NonVegMasterService } from '../non-veg-master.service';
import { NonVegCategoryService } from '../../non-veg-category/non-veg-category.service';


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

  nonVegItemForm!: FormGroup;
  id: any;
  itemData: any;
  categoryList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private service: NonVegMasterService,
    private categoryService: NonVegCategoryService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");

    this.nonVegItemForm = this.fb.group({
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
    return this.nonVegItemForm.controls;
  }

  fetchCategoryList() {
    let url = 'http://127.0.0.1:3000/non-veg-categories'; // New API endpoint
    this.categoryService.getAllCategories(url).subscribe(
      (res: any) => {
        if (res) {
          this.categoryList = res;
        } else {
          console.error('Error fetching category data:', res);
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  onCategoryChange(event: any) {
    const selectedCategoryId = event.target.value;
    console.log('Selected Category ID:', selectedCategoryId);
  }

  async patchItemById(id: any) {
    let url = 'http://127.0.0.1:3000/non-vegs/' + id;
    (await this.service.getItemById(url)).subscribe((res) => {
      this.itemData = res;
      this.nonVegItemForm.patchValue(this.itemData);
    });
  }

  onSubmit() {
    if (this.nonVegItemForm.invalid) {
      return;
    }

    const itemData = this.nonVegItemForm.value;

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
            let url = 'http://127.0.0.1:3000/non-vegs/' + this.id;
            (await this.service.updateItem(url, itemObj)).subscribe(() => {
              this.router.navigate(['/dashboard/non-veg-master/list']);
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
            let url = 'http://127.0.0.1:3000/non-vegs';
            (await this.service.createItem(url, itemObj)).subscribe(() => {
              this.router.navigate(['/dashboard/non-veg-master/list']);
            });
          }
        });
    }
  }

  goToProfile() {
    this.router.navigate(["/dashboard/profile/profile-info"]);
  }


}
