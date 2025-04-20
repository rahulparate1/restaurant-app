import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { ExitProcessService } from '../exit-process.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { reasonList, statusList } from '../exit-data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { rolesType } from 'full/shared/constant';
import { ApiService } from 'src/app/services/api.service';
import { DOCUMENT } from '@angular/common';
import { DocumentExtensions } from 'src/app/layouts/full/shared/constant';

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
  selector: 'app-exit-process-details',
  templateUrl: './exit-process-details.component.html',
  styleUrls: ['./exit-process-details.component.css']
})
export class ExitProcessDetailsComponent {
  @ViewChild('fileInput') fileInput: ElementRef;

  resignationDate: string;
  id: any;
  exitProcessDetails: any;
  commentForm: FormGroup;
  data: any;
  statusList: any = statusList;
  files: any;
  image: string | ArrayBuffer;
  isUploadStarted: boolean = false;
  showGallery: boolean = true;
  exitDocuments: ExitDocument[] = [];
  user: any;
  designation: any;
  reasonList: any = reasonList;
  isApproved: boolean = false;
  employee: any;
  exitApproved: boolean = false;
  employeeData: any[];
  employeeDetails: any;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileError: any;
  isExitProcessMarked = false;
  designationRole: { key: string; value: string }[];
  approvedForm: UntypedFormGroup;
  rejectForm: UntypedFormGroup;
  withdrawForm: UntypedFormGroup;
  exitMarkForm: FormGroup;
  approveDetails: any;
  rejectDetails: any;
  markExitDetails: any;
  loginUser: any;
  withdrawDetails: any;
  isEditingComment = false;
  today: any;
  tomorrow: any;
  editingCommentIndex: number | null = null;
  selectedDocumentType: string | Blob;
  isFileValid: boolean = true;
  isEditing = false;

  documentTypes = [
    { nameDoc: 'Experience Letter' },
    { nameDoc: '3 Months of Payslip' },
    { nameDoc: 'Relieving Letter' }
  ];



  constructor(
    private service: ExitProcessService,
    public router: Router,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private employeeService: EmployeeManagementService,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.user?.roles[0];
    const firstName = this.user?.employee?.basicDetails?.firstName || "";
    const lastName = this.user?.employee?.basicDetails?.lastName || "";
    this.loginUser = `${firstName} ${lastName}`.trim();
    this.id = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.designationRole = rolesType;
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.user?.roles[0];
    this.getExitProcessData(this.id);
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.today = new Date();
    // this.today = new Date().toISOString().split('T')[0];

    let tomorrow = new Date(this.today);
    tomorrow.setDate(this.today.getDate() + 1);

    // Format tomorrow's date to yyyy-mm-dd format
    this.tomorrow = tomorrow.toISOString().split('T')[0];

    this.approvedForm = this.formBuilder.group({
      comment: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
      // lastWorkingDate: [new Date(), [Validators.required]],
      // lastWorkingDate: [this.tomorrow, [Validators.required]],
      lastWorkingDate: [this.tomorrow, [Validators.required, this.yearLengthValidator]]
    });


    this.rejectForm = this.formBuilder.group({
      comment: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

    this.withdrawForm = this.formBuilder.group({
      comment: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });


    this.exitMarkForm = this.formBuilder.group({
      reason: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

    this.commentForm = this.formBuilder.group({
      commentText: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

  }

  fileTypes = {
    pdf: 'application/pdf',
    text: 'text/plain'
  };
  icons = {
    pdf: 'fas fa-file-pdf',
    text: 'fas fa-file-alt'
  };



  // Helper function to get tomorrow's date in YYYY-MM-DD format
  getTomorrowDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0]; // Returns in 'YYYY-MM-DD'
  }

  // Validator to check if the year is exactly 4 digits
  yearLengthValidator(control: any) {
    if (control.value) {
      const year = control.value.split('-')[0];  // Extract the year part
      if (year.length !== 4) {
        return { invalidYear: true };  // Invalid year (more or less than 4 digits)
      }
    }
    return null;  // Valid year
  }

  // Handle the input event to ensure the user cannot enter more than 4 digits in the year
  onDateInputChange(event: any): void {
    const inputValue = event.target.value;
    const year = inputValue.split('-')[0];  // Get the year part of the input

    // If more than 4 digits in the year, trim it
    if (year.length > 4) {
      const correctedValue = `${year.slice(0, 4)}-${inputValue.split('-')[1]}-${inputValue.split('-')[2]}`;
      event.target.value = correctedValue;  // Update the input value
    }
  }


  getStatusLabel(id) {
    return this.statusList.find((x) => x.id == id)?.label;
  }

  getReasonList(id) {
    return this.reasonList.find((x) => x.id == id)?.label;
  }
  async getExitProcessData(id: string) {
    this.exitDocuments = [];
    (await this.service.getExitProcessById(id)).subscribe(
      (res: any) => {
        this.exitProcessDetails = res;
        if (this.exitProcessDetails?.userId) {
          this.getEmplyeeDetails(
            this.exitProcessDetails.userId,
            this.exitProcessDetails.id
          );
        }
        if (this.exitProcessDetails.exitDocuments?.documents) {
          this.exitDocuments = this.exitProcessDetails?.exitDocuments?.documents?.map(doc => ({
            url: doc ?? 'NA',
            type: this.getFileType(doc) ?? 'NA'
          }));
        }
        
        // Check if "Marked Exit Process" exists in activity logs
        this.isExitProcessMarked = this.exitProcessDetails?.activityLogs?.some(log => log.action === "Marked Exit Process");
      },
      (error) => {
        console.error('Error fetching exit process data:', error);
      }
    );
  }
  

  // async getExitProcessData(id: string) {
  //   this.exitDocuments = [];
  //   (await this.service.getExitProcessById(id)).subscribe(
  //     (res: any) => {
  //       this.exitProcessDetails = res;
  //       if (this.exitProcessDetails?.userId) {
  //         this.getEmplyeeDetails(
  //           this.exitProcessDetails.userId,
  //           this.exitProcessDetails.id
  //         );
  //       }
  //       if (this.exitProcessDetails.exitDocuments?.documents) {
  //         this.exitDocuments = this.exitProcessDetails?.exitDocuments?.documents?.map(doc => ({
  //           url: doc ?? 'NA',
  //           type: this.getFileType(doc) ?? 'NA'
  //         }));
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching exit process data:', error);
  //     }
  //   );
  // }


  async getEmplyeeDetails(userId: string, exitProcessId: string) {
    (await this.employeeService.getEmployeeByUserId(userId)).subscribe(
      (res: any) => {
        this.employeeDetails = res.data;
        this.employeeDetails.exitProcessId = exitProcessId;
      },
      (error) => {
        console.error('Error fetching employee details:', error);
      }
    );
  }


  // Toggle edit mode
  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }
  // Validate that the year part of the date is exactly 4 digits
  isValidYear(date: string): boolean {
    if (date) {
      const year = date.split('-')[0];  // Extract the year from the date string
      return year.length === 4;  // Check if the length is exactly 4
    }
    return false;
  }
  async saveLastWorkingDate() {
    if (!this.exitProcessDetails?.lastWorkingDate || !this.isValidYear(this.exitProcessDetails.lastWorkingDate)) {
      // If there is no last working date or the year is invalid, just return without showing alert
      return;
    }
  
    // Show confirmation dialog before saving
    const formattedLastWorkingDate = new Date(this.exitProcessDetails.lastWorkingDate).toLocaleDateString();
    const result = await Swal.fire({
      title: `Your last working date is ${formattedLastWorkingDate}. Are you sure you want to mark the exit process?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    });
  
    if (!result.isConfirmed) {
      return; // If the user cancels, exit the function
    }
  
    // Prepare the data to be updated
    const updatedData = {
      lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
      activityLogs: this.exitProcessDetails.activityLogs || [], // Add existing activity logs or an empty array if none exist
    };
  
    const updatedBy = this.loginUser;
  
    // Add activity log for this change with only lastWorkingDate
    const activityLogData = {
      action: 'Edited Last Working Date',
      lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
      timestamp: new Date().toISOString(),
      updatedBy,
      employeeId: this.exitProcessDetails.employeeId,
      companyId: this.exitProcessDetails.companyId,
    };
  
    // Push the new activity log to the existing activityLogs array
    updatedData.activityLogs.push(activityLogData);
  
    // Call the service to update the exit process with both lastWorkingDate and activityLogs
    (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedData)).subscribe(
      (response) => {
        this.isEditing = false;  // Exit the edit mode
        Swal.fire({
          title: 'Last Working Date updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      },
      (error) => {
        console.error("Error updating exit process", error);
        Swal.fire({
          title: 'There was an issue updating the exit process.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  


  // async saveLastWorkingDate() {
  //   if (!this.exitProcessDetails?.lastWorkingDate) {
  //     alert("Please select a Last Working Date.");
  //     return;
  //   }
  
  //   // Validate the year in lastWorkingDate to ensure it's 4 digits
  //   const year = this.exitProcessDetails.lastWorkingDate.split('-')[0];  // Extract the year
  //   if (year.length !== 4) {
  //     alert("The year must be exactly 4 digits.");
  //     return;
  //   }
  
  //   // Prepare the data to be updated
  //   const updatedData = {
  //     lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
  //     activityLogs: this.exitProcessDetails.activityLogs || [], // Add existing activity logs or an empty array if none exist
  //   };
  
  //   const updatedBy = this.loginUser;
  
  //   // Add activity log for this change with only lastWorkingDate
  //   const activityLogData = {
  //     action: 'Edited Last Working Date',
  //     lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
  //     timestamp: new Date().toISOString(),
  //     updatedBy,
  //     employeeId: this.exitProcessDetails.employeeId,
  //     companyId: this.exitProcessDetails.companyId,
  //   };
  
  //   // Push the new activity log to the existing activityLogs array
  //   updatedData.activityLogs.push(activityLogData);
  
  //   // Call the service to update the exit process with both lastWorkingDate and activityLogs
  //   (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedData)).subscribe(
  //     (response) => {
  //       this.isEditing = false;  // Exit the edit mode
  //       alert("Last Working Date updated successfully.");
  //     },
  //     (error) => {
  //       console.error("Error updating exit process", error);
  //       alert('There was an issue updating the exit process.');
  //     }
  //   );
  // }
  
  // async saveLastWorkingDate() {
  //   if (!this.exitProcessDetails?.lastWorkingDate) {
  //     alert("Please select a Last Working Date.");
  //     return;
  //   }

  //   // Prepare the data to be updated
  //   const updatedData = {
  //     lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
  //     activityLogs: this.exitProcessDetails.activityLogs || [], // Add existing activity logs or an empty array if none exist
  //   };
  //   const updatedBy = this.loginUser;
  //   // Add activity log for this change with only lastWorkingDate
  //   const activityLogData = {
  //     action: 'Edited Last Working Date',
  //     lastWorkingDate: this.exitProcessDetails.lastWorkingDate,
  //     timestamp: new Date().toISOString(),
  //     updatedBy,
  //     employeeId: this.exitProcessDetails.employeeId,
  //     companyId: this.exitProcessDetails.companyId,
  //   };

  //   // Push the new activity log to the existing activityLogs array
  //   updatedData.activityLogs.push(activityLogData);

  //   // Call the service to update the exit process with both lastWorkingDate and activityLogs
  //   (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedData)).subscribe(
  //     (response) => {
  //       this.isEditing = false;  // Exit the edit mode
  //     },
  //     (error) => {
  //       console.error("Error updating exit process", error);
  //       alert('There was an issue updating the exit process.');
  //     }
  //   );
  // }



  // Correctly defined method
  canEditLastWorkingDate(): boolean {
    return !this.isEditing && this.exitProcessDetails?.lastWorkingDate !== '';
  }


  getDocumentPreview(fileUrl: string) {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();  // Get the file extension in lowercase

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

  // Validate file type against DocumentExtensions
  validateFileType(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return DocumentExtensions.includes(fileExtension || '');  // Returns true if valid, false if invalid
  }



  handleFileInput(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.files = Array.from(event.target.files);  // Convert FileList to an array of files
      this.fileError = '';
      this.isFileValid = true;

      // Check for file validity
      this.isFileValid = this.files.every((file) => {
        const isValidType = this.validateFileType(file);  // Validate file type
        const isValidSize = file.size <= 5 * 1024 * 1024;  // 5MB size limit

        if (!isValidType) {
          this.fileError = 'Invalid file type. Please upload a document with a valid extension (pdf only).';
          this.isFileValid = false;
        } else if (!isValidSize) {
          this.fileError = 'File size exceeds the 5MB limit.';
          this.isFileValid = false;
        }

        return isValidType && isValidSize;  // Ensure both type and size are valid
      });

      if (!this.isFileValid) {
      } else {
      }
    } else {
      this.isFileValid = false;
      this.fileError = 'Please select a file before uploading.';
    }
  }


  uploadDocument(): void {
    if (this.files.length > 0 && this.isFileValid && this.selectedDocumentType) {
      // Start upload and reset file validation
      this.isUploadStarted = true;
      this.uploadDocumentGallery();  // Proceed with file upload

      // Reset file validation state after the first upload
      this.isFileValid = false;
      this.selectedDocumentType = null;
      this.fileInput.nativeElement.value = '';  // Clear file input
    } else {
      this.fileError = 'Please select a file before uploading';
    }
  }

  // Upload multiple files (if any)
  async uploadDocumentGallery(): Promise<void> {
    try {
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        await this.uploadFile(file);  // Upload each file one by one
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      this.fileError = 'Error occurred while uploading the files';
      this.isUploadStarted = false;
    }
  }

  // Upload a single file
  async uploadFile(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);  // Append file to FormData
      formData.append('documentName', this.selectedDocumentType);  // Include document type name
      const documentId = this.exitProcessDetails.id;  // Exit process ID
      await this.service.uploadFileWithDocumentName(formData, documentId, (response: any) => {
        // Check if the response is valid
        if (response && response.isSuccess && response.url) {
          this.selectedDocumentType = null;
          this.fileInput.nativeElement.value = '';
          // Create a document object to add to the gallery
          const document = {
            url: response.url,
            nameDoc: this.selectedDocumentType,  // Use the selected document type
            type: file.type,  // File type (image/pdf/text)
          };
          this.exitDocuments.push(document);
          this.showGallery = true;  // Show gallery as soon as the document is added
          this.fileError = '';  // Clear any error messages
          this.getExitProcessData(this.exitProcessDetails.id);
        } else {
          console.error('Invalid response format:', response);
          this.fileError = 'Invalid server response';
        }
      });
    } catch (error) {
      console.error('Error during file upload:', error);
      this.fileError = 'Failed to upload document';
    } finally {
      this.isUploadStarted = false;  // Ensure upload indicator is turned off
    }
  }


  getFileIcon(fileType: string): string {
    if (fileType.startsWith(this.fileTypes.pdf)) {
      return this.icons.pdf;
    } else if (fileType.startsWith(this.fileTypes.text)) {
      return this.icons.text;
    }
    return '';
  }

  setMainImage(img: string) {
    this.image = img;
  }

  async deleteImage(index: number) {
    const deletedDocument = this.exitProcessDetails.exitDocuments.documents[index];
    this.exitProcessDetails.exitDocuments.documents.splice(index, 1);

    if (this.id) {
      (await this.service.removeDocument(this.id, index)).subscribe(
        (res) => {
        },
        (err) => {
          console.error('Error deleting document:', err);
          this.exitProcessDetails.exitDocuments.documents.splice(index, 0, deletedDocument);
        }
      );
    }
  }


  // Helper function to check if the file is an image
  isImage(fileUrl: string): boolean {
    return fileUrl.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }

  // Helper function to check if the file is a PDF
  isPdf(fileUrl: string): boolean {
    return fileUrl.match(/\.pdf$/) != null;
  }

  // Helper function to check if the file is a text file
  isTextFile(fileUrl: string): boolean {
    return fileUrl.match(/\.(txt)$/) != null;
  }
  navagatToExitProcess() {
    this.router.navigate(['exit-process/list']);
  }


  getFileType(url: string | null): string {
    if (!url) return 'unknown';

    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
        return 'image';
      case 'pdf':
        return 'pdf';
      case 'plain':
      case 'txt':
        return 'text';
      default:
        return 'unknown';
    }
  }

  getDocumentData() {
    return this.exitProcessDetails.gallery
      .filter(url => url !== null)
      .map(url => ({
        url,
        type: this.getFileType(url)
      }));
  }

  async updateStatusForWithdraw(id) {
    const comment = this.withdrawForm.get("comment").value;

    if (!this.withdrawDetails?.id) {
      console.error("Withdraw details ID is missing.");
      return; // Don't proceed if there's no valid ID
    }

    const withdrawOn = new Date().toISOString();
    const withdrawBy = this.loginUser;

    const data = {
      comment,
      status: "4",  // Status for withdrawal (you can change this value based on your application's logic)
      withdrawOn,
      withdrawBy,
    };

    // Prepare the activity log entry for withdrawal action
    const activityLogData = {
      userId: this.loginUser.userId, // Assuming userId is present
      action: 'Withdraw Exit Process', // Action description
      status: "4", // Withdrawal status
      comment, // The comment added for withdrawal
      withdrawOn,
      withdrawBy,
      timestamp: new Date().toISOString(),
    };

    // Add the activity log entry to the exit process details (or an activityLogs array)
    if (!this.exitProcessDetails.activityLogs) {
      this.exitProcessDetails.activityLogs = [];
    }
    // Push the activity log entry into the activityLogs array
    this.exitProcessDetails.activityLogs.push(activityLogData);
    // Combine the status and activity log updates into a single update request
    const updatedExitProcess = {
      // ...this.exitProcessDetails,  // Existing exit process data
      status: data.status,  // Update status to "1" (Approved)
      activityLogs: this.exitProcessDetails.activityLogs,  // Append the new activity log
    };

    // Make the API call to update both status and activity logs
    (await this.service.updateExitProcess(id, updatedExitProcess)).subscribe(
      (res) => {
        // Successfully updated status and activity log
        this.modalService.dismissAll();  // Close the modal
        this.router.navigate(['exit-process/list']);  // Navigate to the list page
      },
      (error) => {
        console.error("Error updating exit process", error);  // Log any errors
      }
    );
  }


  centerModalForWithdraw(withdrawDataModal: any) {
    if (this.exitProcessDetails) {
      // Set the current exit process details
      this.withdrawDetails = this.exitProcessDetails;
      this.modalService.open(withdrawDataModal, { centered: true });
    } else {
      console.error("Error: Exit process details are undefined.");
    }
  }

  async updateStatusForApprove(id) {
    const comment = this.approvedForm.get("comment").value;
    const lastWorkingDate = this.approvedForm.get('lastWorkingDate').value;

    if (!this.approveDetails?.id) {
      return;
    }

    // Prepare the data object for the update
    const approvedOn = new Date().toISOString();
    const approvedBy = this.loginUser;

    // Create the updated data object with status and activity log
    const data = {
      status: "1",  // Approved status
      lastWorkingDate,  // Include the last working date (if needed)
      comment,  // Include the comment added for approval
      approvedOn,
      approvedBy,
    };

    // Prepare the activity log entry for the approval action
    const activityLogData = {
      action: 'Approved Exit Process',  // Action description
      status: "1",  // Approved status
      lastWorkingDate,  // Same last working date
      approvedOn,
      approvedBy,
      comment,  // The comment added for approval
      timestamp: new Date().toISOString(),
      employeeId: this.exitProcessDetails.employeeId,  // Employee ID
      companyId: this.exitProcessDetails.companyId,  // Company ID
    };

    // Add the activity log entry to the exit process details
    if (!this.exitProcessDetails.activityLogs) {
      this.exitProcessDetails.activityLogs = [];
    }

    // Push the activity log entry into the activityLogs array
    this.exitProcessDetails.activityLogs.push(activityLogData);

    // Combine the status, lastWorkingDate, and activity log updates into a single update request
    const updatedExitProcess = {
      // ...this.exitProcessDetails,  // Existing exit process data
      status: data.status,  // Update status to "1" (Approved)
      lastWorkingDate: data.lastWorkingDate,  // Last working date
      activityLogs: this.exitProcessDetails.activityLogs,  // Updated activity logs
    };
    (await this.service.updateExitProcess(id, updatedExitProcess)).subscribe(
      (res) => {
        this.modalService.dismissAll();  // Close the modal
        this.router.navigate(['exit-process/list']);  // Navigate to the list page
      },
      (error) => {
        console.error("Error updating exit process", error);  // Log any errors
        Swal.fire('Error', 'There was an issue updating the exit process.', 'error');
      }
    );
  }


  centerModalForApprove(approveDataModal: any) {
    if (this.exitProcessDetails) {
      // Set the current exit process details
      this.approveDetails = this.exitProcessDetails;
      this.modalService.open(approveDataModal, { centered: true });
    } else {
      console.error("Error: Exit process details are undefined.");
    }
  }

  async updateStatusForReject(id) {
    const comment = this.rejectForm.get("comment").value;
    if (!this.rejectDetails?.id) {
      console.error("Resignation ID is missing.");
      return;
    }

    const rejectedOn = new Date().toISOString();
    const rejectedBy = this.loginUser;

    const data = {
      comment,
      status: "2", // Rejected status (you can change this value based on your application's logic)
      rejectedOn,
      rejectedBy,
    };

    // Prepare the activity log entry for rejection action
    const activityLogData = {
      userId: this.loginUser.userId, // Assuming userId is present
      action: 'Rejected Exit Process', // Action description
      status: "2", // Rejected status
      comment, // The comment added for rejection
      rejectedOn,
      rejectedBy,
      timestamp: new Date().toISOString(),
    };

    // Add the activity log entry to the exit process details (or an activityLogs array)
    if (!this.exitProcessDetails.activityLogs) {
      this.exitProcessDetails.activityLogs = [];
    }

    // Push activity log entry into the activityLogs array
    this.exitProcessDetails.activityLogs.push(activityLogData);


    // Combine the status and activity log updates into a single update request
    const updatedExitProcess = {
      // ...this.exitProcessDetails,  // Existing exit process data
      status: data.status,  // Update status to "1" (Approved)
      activityLogs: this.exitProcessDetails.activityLogs,  // Append the new activity log
    };

    // Make the API call to update both status and activity logs
    (await this.service.updateExitProcess(id, updatedExitProcess)).subscribe(
      (res) => {
        // Successfully updated status and activity log
        this.modalService.dismissAll();  // Close the modal
        this.router.navigate(['exit-process/list']);  // Navigate to the list page
      },
      (error) => {
        console.error("Error updating exit process", error);  // Log any errors
      }
    );
  }

  centerModalForReject(rejectDataModal: any) {
    if (this.exitProcessDetails) {
      // Set the current exit process details
      this.rejectDetails = this.exitProcessDetails;
      this.modalService.open(rejectDataModal, { centered: true });
    } else {
      console.error("Error: Exit process details are undefined.");
    }
  }

  centerModalForMarkExit(exitDataModal: any) {
    if (this.exitProcessDetails) {
      this.markExitDetails = this.exitProcessDetails;
      this.modalService.open(exitDataModal, { centered: true });
    } else {
      console.error("Error: Exit process details are undefined.");
    }
  }



  async markExit() {
    if (this.exitMarkForm.invalid) {
      return; // Prevent submission if the form is invalid
    }
  
    try {
      const reason = this.exitMarkForm.value.reason; // Get the reason from the form
      const lastWorkingDate = this.exitProcessDetails.lastWorkingDate; // Get last working date from exitProcessDetails
  
      // Convert the last working date to Date object for comparison
      const today = new Date();
      const lastWorkingDateObj = new Date(lastWorkingDate);
  
      // Format the date as dd-MM-yyyy (UK style)
      const formattedLastWorkingDate = new Date(lastWorkingDate).toLocaleDateString('en-GB');
  
      // Prepare the activity log entry for marking the exit
      const activityLogData = {
        userId: this.loginUser.userId,
        action: 'Marked Exit Process',
        markBy: this.loginUser.fullName,  // Assuming full name or username
        timestamp: new Date().toISOString(),
        reason: reason,  // Add reason to the activity log
      };
  
      // Add the activity log entry to the exit process details (or an activityLogs array)
      if (!this.exitProcessDetails.activityLogs) {
        this.exitProcessDetails.activityLogs = [];
      }
      this.exitProcessDetails.activityLogs.push(activityLogData);
  
      // Update the exit process only with the new activity log
      const updatedExitProcess = {
        activityLogs: this.exitProcessDetails.activityLogs, // Only update activityLogs
      };
  
      // If last working date is in the future, show confirmation
      if (lastWorkingDateObj > today) {
        swalWithBootstrapButtons
          .fire({
            title: `Your last working date is ${formattedLastWorkingDate}. Are you sure you want to mark the exit process?`,
            icon: 'warning',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            showCancelButton: true,
          })
          .then(async (result) => {
            // Close any open modals
            this.modalService.dismissAll();
  
            if (result.value) {
              // Proceed with exit process marking if confirmation is "Yes"
              this.employeeDetails.exitStatus = true;
              this.employeeDetails.exitProcessId = this.exitProcessDetails.id;
  
              // Prepare the employee update payload (only necessary fields)
              const employeeUpdatePayload = {
                id: this.employeeDetails.id,
                exitStatus: this.employeeDetails.exitStatus,
                exitProcessId: this.employeeDetails.exitProcessId,
                lastWorkingDate: lastWorkingDate,  // Get the last working date from exitProcessDetails
                exitReason: reason,
              };
  
              // Send the employee update request
              (await this.employeeService.updateEmployee(this.employeeDetails.id, employeeUpdatePayload)).subscribe(
                async (updatedEmployee: any) => {
                  // On success, update exit process
                  (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedExitProcess)).subscribe(
                    (res) => {
                      // Successfully updated exit process, set the flag to show the message
                      this.isExitProcessMarked = true; // Set flag to true to display the message
                      this.router.navigate(['exit-process/list']);
                    },
                    (error) => {
                      console.error('Error updating exit process:', error);
                    }
                  );
                },
                (error) => {
                  console.error('Error updating employee status:', error);
                }
              );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // If the user clicks "No", call getExitProcessData to refresh the data
              this.getExitProcessData(this.exitProcessDetails.id);  // Pass the exit process ID here
            }
          });
      } else {
        // If last working date is not in the future, proceed without confirmation
        this.employeeDetails.exitStatus = true;
        this.employeeDetails.exitProcessId = this.exitProcessDetails.id;
  
        // Prepare the employee update payload (only necessary fields)
        const employeeUpdatePayload = {
          id: this.employeeDetails.id,
          exitStatus: this.employeeDetails.exitStatus,
          exitProcessId: this.employeeDetails.exitProcessId,
        };
  
        // Send the employee update request
        (await this.employeeService.updateEmployee(this.employeeDetails.id, employeeUpdatePayload)).subscribe(
          async (updatedEmployee: any) => {
            // On success, update exit process
            (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedExitProcess)).subscribe(
              (res) => {
                // Successfully updated exit process, set the flag to show the message
                this.isExitProcessMarked = true; // Set flag to true to display the message
                this.router.navigate(['exit-process/list']);
              },
              (error) => {
                console.error('Error updating exit process:', error);
              }
            );
          },
          (error) => {
            console.error('Error updating employee status:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error updating exit status:', error);
    }
  }
  

  // async markExit() {
  //   if (this.exitMarkForm.invalid) {
  //     return; // Prevent submission if the form is invalid
  //   }

  //   try {
  //     const reason = this.exitMarkForm.value.reason; // Get the reason from the form
  //     const lastWorkingDate = this.exitProcessDetails.lastWorkingDate; // Get last working date from exitProcessDetails

  //     // Convert the last working date to Date object for comparison
  //     const today = new Date();
  //     const lastWorkingDateObj = new Date(lastWorkingDate);

  //     // Format the date as dd-MM-yyyy (UK style)
  //     const formattedLastWorkingDate = new Date(lastWorkingDate).toLocaleDateString('en-GB');

  //     // Prepare the activity log entry for marking the exit
  //     const activityLogData = {
  //       userId: this.loginUser.userId,
  //       action: 'Marked Exit Process',
  //       markBy: this.loginUser.fullName,  // Assuming full name or username
  //       timestamp: new Date().toISOString(),
  //       reason: reason,  // Add reason to the activity log
  //     };

  //     // Add the activity log entry to the exit process details (or an activityLogs array)
  //     if (!this.exitProcessDetails.activityLogs) {
  //       this.exitProcessDetails.activityLogs = [];
  //     }
  //     this.exitProcessDetails.activityLogs.push(activityLogData);

  //     // Update the exit process only with the new activity log
  //     const updatedExitProcess = {
  //       activityLogs: this.exitProcessDetails.activityLogs, // Only update activityLogs
  //     };

  //     // If last working date is in the future, show confirmation
  //     if (lastWorkingDateObj > today) {
  //       swalWithBootstrapButtons
  //         .fire({
  //           title: `Your last working date is ${formattedLastWorkingDate}. Are you sure you want to mark the exit process?`,
  //           icon: 'warning',
  //           confirmButtonText: 'Yes',
  //           cancelButtonText: 'No',
  //           showCancelButton: true,
  //         })
  //         .then(async (result) => {
  //           // Close any open modals
  //           this.modalService.dismissAll();

  //           if (result.value) {
  //             // Proceed with exit process marking if confirmation is "Yes"
  //             this.employeeDetails.exitStatus = true;
  //             this.employeeDetails.exitProcessId = this.exitProcessDetails.id;

  //             // Prepare the employee update payload (only necessary fields)
  //             const employeeUpdatePayload = {
  //               id: this.employeeDetails.id,
  //               exitStatus: this.employeeDetails.exitStatus,
  //               exitProcessId: this.employeeDetails.exitProcessId,
  //               lastWorkingDate: lastWorkingDate,  // Get the last working date from exitProcessDetails
  //               exitReason: reason,
  //             };

  //             // Send the employee update request
  //             (await this.employeeService.updateEmployee(this.employeeDetails.id, employeeUpdatePayload)).subscribe(
  //               async (updatedEmployee: any) => {
  //                 // On success, update exit process
  //                 (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedExitProcess)).subscribe(
  //                   (res) => {
  //                     // Successfully updated exit process, navigate to list page
  //                     this.router.navigate(['exit-process/list']);
  //                   },
  //                   (error) => {
  //                     console.error('Error updating exit process:', error);
  //                   }
  //                 );
  //               },
  //               (error) => {
  //                 console.error('Error updating employee status:', error);
  //               }
  //             );
  //           } else if (result.dismiss === Swal.DismissReason.cancel) {
  //           }
  //         });
  //     } else {
  //       // If last working date is not in the future, proceed without confirmation
  //       this.employeeDetails.exitStatus = true;
  //       this.employeeDetails.exitProcessId = this.exitProcessDetails.id;

  //       // Prepare the employee update payload (only necessary fields)
  //       const employeeUpdatePayload = {
  //         id: this.employeeDetails.id,
  //         exitStatus: this.employeeDetails.exitStatus,
  //         exitProcessId: this.employeeDetails.exitProcessId,
  //       };

  //       // Send the employee update request
  //       (await this.employeeService.updateEmployee(this.employeeDetails.id, employeeUpdatePayload)).subscribe(
  //         async (updatedEmployee: any) => {
  //           // On success, update exit process
  //           (await this.service.updateExitProcess(this.exitProcessDetails.id, updatedExitProcess)).subscribe(
  //             (res) => {
  //               // Successfully updated exit process, navigate to list page
  //               this.router.navigate(['exit-process/list']);
  //             },
  //             (error) => {
  //               console.error('Error updating exit process:', error);
  //             }
  //           );
  //         },
  //         (error) => {
  //           console.error('Error updating employee status:', error);
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error updating exit status:', error);
  //   }
  // }


  async postComment() {
    const commentText = this.commentForm.value.commentText;
    if (this.commentForm.invalid) {
      return;
    }

    const commentObj: any = {
      commentText,
      userId: this.user?.user?.id,
      commentedBy: this.loginUser,
      commentDate: new Date(),
      userImage: this.loginUser?.employee?.basicDetails?.image,
    };

    if (!this.exitProcessDetails.comments) {
      this.exitProcessDetails.comments = [];
    }

    // If editing an existing comment, update it; otherwise, add a new comment at the top
    if (this.isEditingComment && this.editingCommentIndex !== null) {
      this.exitProcessDetails.comments[this.editingCommentIndex] = commentObj;
    } else {
      // Add new comment at the beginning (top of the list)
      this.exitProcessDetails.comments.unshift(commentObj);
    }

    // Only update the comments part of the exit process
    const updatedExitProcess = {
      comments: this.exitProcessDetails.comments,
    };

    if (this.commentForm.status !== 'INVALID' && this.id) {
      this.apiService.startLoader();

      // Send only the updated comment data
      (await this.service.updateExitProcess(this.id, updatedExitProcess)).subscribe(
        () => {
          this.apiService.stopLoader();
          this.commentForm.reset();
          this.isEditingComment = false;
          this.editingCommentIndex = null;
        },
        (error: any) => {
          console.error('Error posting/updating comment:', error);
          this.apiService.stopLoader();
        }
      );
    }
  }





  async deleteComment(index) {
    if (index >= 0 && index < this.exitProcessDetails.comments.length) {
      const removedComment = this.exitProcessDetails.comments.splice(index, 1)[0];
      this.apiService.startLoader();
      (await this.service.updateExitProcess(this.id, this.exitProcessDetails)).subscribe(
        (res) => {
          this.apiService.stopLoader();
          // Reload the page after the comment is deleted
          this.document.location.reload();
        },
        (error) => {
          console.error('Error deleting comment:', error);
          this.apiService.stopLoader();
          // If there's an error, restore the removed comment
          this.exitProcessDetails.comments.splice(index, 0, removedComment);
        }
      );
    } else {
      console.error('Invalid index provided for deletion.');
    }
  }

  downloadImage(url: string, fileName: string) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.click();
  }


  editComment(index: number) {
    const comment = this.exitProcessDetails.comments[index];
    this.commentForm.patchValue({
      commentText: comment.commentText,
    });
    this.isEditingComment = true;
    this.editingCommentIndex = index;
  }

  cancelEdit() {
    this.commentForm.reset();
    this.isEditingComment = false;
    this.editingCommentIndex = null;
  }


  getStatusClass(statusId: any): string {
    const status = this.statusList.find((s) => s.id.toString() === statusId.toString());
    return status ? status.className : '';
  }

  hasMarkedExitProcess(): boolean {
    return this.exitProcessDetails?.activityLogs?.some(activity => activity.action === 'Marked Exit Process');
  }

}

interface ExitDocument {
  url?: string;
  nameDoc?: any;
  type?: string;
}

