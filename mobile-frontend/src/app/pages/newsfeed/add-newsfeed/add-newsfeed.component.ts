import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsfeedService } from '../newsfeed.service';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { newsData } from './newsFeedData';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});
@Component({
  selector: 'app-add-newsfeed',
  templateUrl: './add-newsfeed.component.html',
  styleUrls: ['./add-newsfeed.component.css']
})
export class AddNewsfeedComponent implements OnInit {
  newsFeedForm: UntypedFormGroup;
  id: string;
  form: FormGroup;
  image: any;
  file: any;
  newsFeedTypes = newsData.types;
  isActive: boolean = true;
  user: any;
  public Editor = ClassicEditor;
  designation: any;
  newsFeedResp: any;
  newsFeedData: any;
  fileError: any;
  fileExtensionError: boolean;
  isSubmitted = false;
  selectedFile: File | undefined;
  hidden: boolean;
  currentDate: string; // Variable to hold the current date in a readable format

  employeeId: any;
  employeeName: any;
  employeeImage: any;
  employeeEmail: any;

  constructor(
    private formBuilder: FormBuilder,
    private service: NewsfeedService,
    public router: Router,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0]; // Get the current date in yyyy-MM-dd format
    this.employeeId = this.user?.employee?.id;
    this.employeeName = this.user?.user?.name;
    this.employeeImage = this.user?.employee?.basicDetails?.image;
    this.employeeEmail = this.user?.employee?.basicDetails?.email;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.getNewsFeed(this.id);
    }
    this.createForm();
    this.newsFeedForm.patchValue({ date: this.currentDate }); // Set the current date as default

  }

  createForm() {
    this.newsFeedForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      newsType: [null,, [Validators.required]],
      // date: [new Date(), [Validators.required]],
      date: [this.currentDate, [Validators.required]], // Initialize with current date
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      time: ['', [Validators.required, Validators.pattern(/^(?:[1-5]?[0-9]|60)$/)]],
      image: [''],
    });
  }

  // async getNewsFeed(id) {
  //   (await this.service.getNewsFeedById(id)).subscribe(
  //     (res) => {
  //       this.newsFeedData = res;
  //       this.newsFeedForm.patchValue(this.newsFeedData);
  //       this.image = res?.image;
  //     },
  //     (error: any) => {
  //       console.error('Error fetching news feeds details:', error);
  //     }
  //   );
  // }

  async getNewsFeed(id) {
    (await this.service.getNewsFeedById(id)).subscribe(
      (res) => {
        this.newsFeedData = res;

         // Ensure 'type' is assigned correctly as 'newsType'
      const newsTypeValue = res?.newsType ? res.newsType.toString() : '';
        // Convert date string to Date object
        const originalDate = res?.date ? new Date(res.date) : null;

        // Convert date to 'dd-mm-yyyy hh:mm' format for display
        const formattedDate = originalDate ? this.formatDate(originalDate) : '';

        // Patch values correctly
        this.newsFeedForm.patchValue({
          title: res?.title || '',
          newsType: newsTypeValue, // Ensure correct type assignment
          date: formattedDate, // Use formatted date for display
          description: res?.description || '',
          time: res?.time || '',
        });

        this.image = res?.image || '';
      },
      (error: any) => {
        console.error('Error fetching news feed details:', error);
      }
    );
  }
  formatDate(date: Date): string {
    if (!date) return '';

    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

async postNewsFeedData(event) {
  const newsFeedObj: any = {};
  newsFeedObj.title= this.newsFeedForm.value.title,
  newsFeedObj.newsType= this.newsFeedForm.value.newsType,
  newsFeedObj.date= new Date(this.newsFeedForm.value.date).toISOString(), // Ensure ISO format
  newsFeedObj.description= this.newsFeedForm.value.description,
  newsFeedObj.time= this.newsFeedForm.value.time
  newsFeedObj.employee = {
    id: this.employeeId,
    name: this.employeeName,
    image: this.employeeImage,
      email: this.employeeEmail
  }
  if (this.newsFeedForm.status !== "INVALID") {
    if (this.id) {
      // Update existing news feed data
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
            // Call update service
            (await this.service.updateNewsFeed(this.id, newsFeedObj)).subscribe(
              async (res: any) => {
                // Handle file attachments if any
                if (this.file) {
                  this.postAttachedFiles(this.id);
                } else {
                  this.newsFeedForm.reset();
                  this.router.navigate(["/general-feed"]);
                }
              }
            );
          }
        });
    } else {
      // Create new news feed data
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add?",
          icon: "success",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            // Call post service
            (await this.service.postNewsFeed(newsFeedObj)).subscribe(
              async (res: any) => {
                if (res) {
                  // Handle notifications
                  const notificationObj: any = {
                    title: "New Event Added",
                    description: "New Event Added: " + this.newsFeedForm?.value?.title,
                  };

                  (
                    await this.service.postNotification(notificationObj)
                  ).subscribe(async (notificationRes) => {
                    if (notificationRes) {
                      this.apiService.stopLoader();
                    }
                  });

                  // Handle file attachments if any
                  if (this.file) {
                    this.postAttachedFiles(res.id);
                  } else {
                    this.newsFeedForm.reset();
                    this.router.navigate(["/general-feed"]);
                  }
                }
              }
            );
          }
        });
    }
  }
}

  async postAttachedFiles(id: string) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.newsFeedForm.reset();
        this.router.navigate(['/general-feed']);
      }
    });
  }

  uploadLogo(event: any) {
    this.fileError = null;
    this.image = null;

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (!['jpg', 'jpeg', 'png', 'svg'].includes(fileExtension)) {
        this.file = null;
        this.fileError = 'Please upload an image with a valid extension (jpg, png, svg, jpeg).';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = 'File size exceeds 5MB limit.';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => (this.image = reader.result);
      reader.readAsDataURL(file);
      this.file = file;
    }
  }

  postCancel() {
    this.router.navigate(['/general-feed']);
  }

  status() {
    this.isActive = !this.isActive;
  }

  onTimeInput(event: any): void {
    const input = event.target.value;
    const numericInput = input.replace(/\D/g, '');
    this.newsFeedForm.controls['time'].setValue(numericInput);
  }
}
