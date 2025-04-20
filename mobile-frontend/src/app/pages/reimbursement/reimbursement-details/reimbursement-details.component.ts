import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ReimbursementService } from "../reimbursement.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "app-reimbursement-details",
  templateUrl: "./reimbursement-details.component.html",
  styleUrls: ["./reimbursement-details.component.css"],
})
export class ReimbursementDetailsComponent {
  breadCrumbItems: Array<{}>;
  reimbursementDetails: any;
  id: any;
  isImageZoomed: boolean = false;
  zoomedImageSrc: string = "";
  safeFileUrl: SafeResourceUrl;

  constructor(
    public router: Router,
    private reimbursementService: ReimbursementService,
    private sanitizer: DomSanitizer,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Reimbursement" },
      { label: "details", active: true },
    ];
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    if (this.id) {
      this.geRreimbursementListDetails(this.id);
    }
  }

  async geRreimbursementListDetails(id) {
    this.apiService.startLoader();
    (await this.reimbursementService.getReimbursementByIdInclude(id)).subscribe(
      (res: any[]) => {
        this.reimbursementDetails = res;
        this.apiService.stopLoader();
        if (this.reimbursementDetails?.image) {
          this.safeFileUrl = this.sanitizeUrl(this.reimbursementDetails.image);
        }
      },
      (error) => {
        console.error("Error fetching reimbursement details", error);
        this.apiService.stopLoader();
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

  downloadFile(fileSrc: string): void {
    const link = document.createElement("a");
    link.href = fileSrc;

    const fileExtension = this.getFileExtension(fileSrc);
    if (fileExtension === "pdf") {
      link.download = "reimbursement_document.pdf";
    } else {
      link.download = "reimbursement_image";
    }
    link.click();
  }

  getFileExtension(fileSrc: string): string {
    if (!fileSrc) {
      return "";
    }
    return fileSrc.split(".").pop().toLowerCase();
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
      return this.sanitizer.bypassSecurityTrustResourceUrl(driveViewerUrl);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
