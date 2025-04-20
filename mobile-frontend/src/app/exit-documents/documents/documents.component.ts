import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ExitProcessService } from 'src/app/pages/exit-process/exit-process.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeManagementService } from 'src/app/pages/employee-management/employee-management.service';
import { FormGroup } from '@angular/forms';
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
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  id: string;
  exitProcessDetails: any;
  commentForm: FormGroup;
  data: any;
  exitDocuments: any;
  user: any;
  designation: any;
  employee: any;
  employeeData: any[] = [];
  employeeDetails: any;

  constructor(
    private service: ExitProcessService,
    public router: Router,
    private activeRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.designation;
    this.id = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getExitProcessData(this.id);
  }

  async getExitProcessData(id: string) {
    this.exitDocuments = null;
    (await this.service.getExitProcessById(id)).subscribe(
      async (res: any[]) => {
        this.exitProcessDetails = res;
        if (this.exitProcessDetails?.userId) {
          this.getEmplyeeDetails(this.exitProcessDetails.userId);
        }
  
        if (
          this.exitProcessDetails.exitDocuments &&
          this.exitProcessDetails.exitDocuments.documents
        ) {
          this.exitDocuments = this.exitProcessDetails.exitDocuments.documents;
          console.log(this.exitDocuments); // Log the documents to verify data
        }
      }
    );
  }
  

  async getEmplyeeDetails(userId) {
    (await this.employeeService.getEmployeeByUserId(userId)).subscribe(
      async (res: any[]) => {
        this.employeeDetails = res;
      }
    );
  }

  // Handle downloading of documents
  downloadImage(url: string, fileName: string) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.click();
  }

  // Method to check file type and return corresponding icon or preview
  // Update this method to handle file types properly and use Font Awesome icons
  getDocumentPreview(fileUrl: string) {
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    if (fileExtension === 'pdf') {
      return { type: 'pdf', icon: 'fas fa-file-pdf', label: 'PDF Document' };
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      return { type: 'word', icon: 'fas fa-file-word', label: 'Word Document' };
    } else if (fileExtension === 'txt') {
      return { type: 'text', icon: 'fas fa-file-alt', label: 'Text File' };
    } else if (['jpeg', 'jpg', 'png'].includes(fileExtension)) {
      return { type: 'image', url: fileUrl, label: 'Image Preview' };
    }
    return { type: 'unsupported', label: 'Unsupported File Type' };
  }
  


  // Set the current year
  year: number = new Date().getFullYear();
  currentSection = 'home';

  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
      navbar.classList.add('nav-sticky')
    } else {
      navbar.classList.remove('nav-sticky')
    }
  }

  toggleMenu() {
    document.getElementById('topnav-menu-content').classList.toggle('show');
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

 logout() {
  debugger
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        icon: 'warning',
        confirmButtonText: 'Yes, Logout!',
        cancelButtonText: 'No',
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          localStorage.clear();
          this.router.navigate(['']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }

  navagatToProfile() {
    this.router.navigate(['exit/profile']);
  }
}
