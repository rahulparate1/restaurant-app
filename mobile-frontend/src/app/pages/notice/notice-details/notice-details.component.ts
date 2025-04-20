import { Component, Inject } from '@angular/core';
import { NoticeService } from '../notice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from "sweetalert2";

//Bootstrap Swal Button styling
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-notice-details',
  templateUrl: './notice-details.component.html',
  styleUrls: ['./notice-details.component.css']
})
export class NoticeDetailsComponent {
  noticeDetailsData: any;
  id: any;
  loggedInUser: any;
  breadCrumbItems: Array<{}>;
  safeFileUrl: SafeResourceUrl;
  isImageZoomed: boolean = false;
  zoomedImageSrc: string = "";

  constructor(
    private activeRoute: ActivatedRoute,
    private service: NoticeService,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router


  ) {
    let userData: any = localStorage?.getItem("payoutUser");
    this.loggedInUser = JSON?.parse(userData);
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Notice" },
      { label: "Notice Details", active: true },
    ];

    if (this.id) {
      this.getNoticeDetails(this.id);
    }
  }


  async getNoticeDetails(id) {
    (await this.service.getNoticeById(id)).subscribe(
      (res) => {
        this.noticeDetailsData = res;
      },
      (error: any) => {
        console.error("Error fetching news feeds details:", error);
      }
    );
  }

  zoomImage(imageSrc: string): void {
    this.zoomedImageSrc = imageSrc;
    this.isImageZoomed = true;
  }

  closeZoom(): void {
    this.isImageZoomed = false;
  }

  // downloadFile(fileSrc: string): void {
  //   const link = document.createElement("a");
  //   link.href = fileSrc;

  //   const fileExtension = this.getFileExtension(fileSrc);
  //   if (fileExtension === "pdf") {
  //     link.download = "notice_document.pdf";
  //   } else {
  //     link.download = "notice_image";
  //   }
  //   link.click();
  // }
  downloadFile(fileSrc: string): void {
    const link = document.createElement('a');
    link.href = fileSrc;

    const fileExtension = this.getFileExtension(fileSrc);
    link.download = fileExtension === 'pdf' ? 'notice_document.pdf' : 'notice_image';
    link.click();
  }

  getFileExtension(fileSrc: string): string {
    return fileSrc?.split(".").pop().toLowerCase();
  }

  isPdfFile(fileSrc: string): boolean {
    return this.getFileExtension(fileSrc) === "pdf";
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    // Use Google Drive viewer for PDF preview
    if (this.isPdfFile(url)) {
      const driveViewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
      )}`;
      return this.sanitizer?.bypassSecurityTrustResourceUrl(driveViewerUrl);
    }
    return this.sanitizer?.bypassSecurityTrustResourceUrl(url);
  }

  openPdf(pdfUrl: string): void {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }

  navigateToEdit(id: any) {
    this.router.navigate(["/notice/create-notice/" + id]);
  }

  async deleteNotice(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        this.apiService.startLoader();
        // Calling Delete API
        if (result.value) {
          (await this.service.deleteNotice(id)).subscribe((res) => {
            this.apiService.stopLoader();
            this.router.navigate(["/general-feed"]);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }
}
