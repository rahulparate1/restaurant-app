import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { reasonList } from '../exit-data';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ExitProcessService } from '../exit-process.service';
import { Router } from '@angular/router';
import { ImageExtensions } from 'src/app/layouts/full/shared/constant';
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
  selector: 'app-exit-process-form',
  templateUrl: './exit-process-form.component.html',
  styleUrls: ['./exit-process-form.component.css'],
  providers: [DatePipe]
})
export class ExitProcessFormComponent {
  today: any;
  exitForm: FormGroup;
  exitProcessResp: any;
  reasonList: any;
  description: string;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileError: any;
  file: any;
  files: any;
  image = [];
  isUploadStarted: boolean;
  userSubmit: boolean = false;
  enableSubmit: boolean = true;
  ImageExtensions: string[];
  DocumentExtensions: string[];
  id: any;
  gallery: string[] = [];
  selectedFile: File | undefined;
  employeeId: any;
  user: any;
  userId: any;

  constructor(
    private formBuilder: FormBuilder,
    private service: ExitProcessService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.userId = this.user?.user?.id;
    this.employeeId = this.user?.employee?.id;
    this.today = new Date().toISOString().split('T')[0];
    this.initializeForm();
    this.reasonList = reasonList;
    this.exitForm.get('title')?.valueChanges.subscribe((value) => {
      if (value) {
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
        if (this.exitForm.get('title')?.value !== capitalizedValue) {
          this.exitForm
            .get('title')
            ?.setValue(capitalizedValue, { emitEvent: false });
        }
      }
    });
  }


  initializeForm(): void {
    this.exitForm = this.formBuilder.group({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^(?!.*[^a-zA-Z0-9\\s])|(no)$'),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
      ]),
      date: new FormControl(this.today, [Validators.required]),
      reason: [null, Validators.required],  // This is the reason control
    });

  }

  navagatToExitProcess() {
    this.router.navigate(['exit-process/list']);
  }

  async onSubmit() {
    this.userSubmit = true;
    let exitProcessObj: any = {};
    exitProcessObj.title = this.exitForm.value.title;
    exitProcessObj.description = this.exitForm.value.description;
    exitProcessObj.date = this.exitForm.value.date;
    exitProcessObj.reason = this.exitForm.value.reason;
    exitProcessObj.status = '3';
    exitProcessObj.employeeId = this.employeeId;
    exitProcessObj.gallery = this.gallery;

    // Function to submit the exitForm
    if (this.exitForm.status != 'INVALID') {
      swalWithBootstrapButtons
        .fire({
          title: 'Are you sure?',
          icon: 'success',
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.service.postExitProcess(exitProcessObj)).subscribe(
              async (res: any) => {
                this.exitProcessResp = res;
                this.exitForm.reset();
                this.router.navigate([
                  'exit-process/details/',
                  this.exitProcessResp?.id,
                ]);
                this.userSubmit = false;
              }
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
    }
  }

  async postAttachedFiles() {
    for (let i = 0; i < this.files.length; i++) {
      (await this.service.commonPostImageGallery(this.files[i])).subscribe(
        (res: any) => {
          if (!this.gallery) {
            this.gallery = [];
          }
          this.gallery?.push(res.url);
          this.isUploadStarted = false;
          this.enableSubmit = false;
        }
      );
    }
    this.isUploadStarted = true;
    this.enableSubmit = true;
  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  fileChangeEvent(event: any): void {
    this.files = event.target.files;
    this.fileError = null;
    this.image = [];
    for (let i = 0; i < this.files.length; i++) {
      const file = event.target.files[i];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (!ImageExtensions.includes(fileExtension)) {
        this.files = null;
        this.fileError =
          'Please upload an document with a valid extension (jpg, png,jpeg,wabp,pdf).';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.files = null;
        this.fileError = 'File size exceeds 5MB limit.';
        return;
      }

      this.fileExtensionError = false;

      const reader = new FileReader();
      reader.onload = (e) => this.image.push(reader.result);
      reader.readAsDataURL(this.files[i]);
    }
    this.postAttachedFiles();
    this.enableSubmit = true;
  }

  setMainImage(img) {
    this.image = img;
  }

  async deleteImage(index) {
    this.gallery.splice(index, 1);
    if (this.id) {
      (await this.service.removeGalleryImages(this.id, index)).subscribe(
        (res) => { },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  updateDescription(event) {
    this.exitForm.get('description').patchValue(event);
    this.exitForm.get('description').markAsDirty();
  }

  getDocumentPreview(fileUrl: string) {
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();  // Get the file extension in lowercase

    if (fileExtension === 'pdf') {
      return { type: 'pdf', icon: 'fas fa-file-pdf', label: 'PDF Document' };
    } else if (fileExtension === 'docx') {
      return { type: 'word', icon: 'fas fa-file-word', label: 'Word Document' };
    } else if (fileExtension === 'txt' || fileExtension === 'plain') {  // Handle .txt and .plain
      return { type: 'text', icon: 'fas fa-file-alt', label: 'Text File' };
    } else if (['jpeg', 'jpg', 'png'].includes(fileExtension)) {
      return { type: 'image', url: fileUrl, label: 'Image Preview' };
    }

    return { type: 'unsupported', label: 'Unsupported File Type' };
  }
}
