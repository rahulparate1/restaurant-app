import { Component } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { LeaveManagementServiceService } from "../leave-management-service.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-leave-details",
  templateUrl: "./leave-details.component.html",
  styleUrls: ["./leave-details.component.css"],
})
export class LeaveDetailsComponent {
  breadCrumbItems: Array<{}>;
  leaveDetails: any; // To store the Details of Activity
  id: any;
  leaveTypes: any[] = []; // Array to hold leave types
  employeeData: any[] = []; // The list of employees fetched from API

  safeFileUrl: SafeResourceUrl;

  constructor(
    private apiService: ApiService,
    private service: LeaveManagementServiceService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.getLeaveType(); // Call to fetch leave types
    this.getEmployee(); // Fetch employee data for CC field

    this.breadCrumbItems = [
      { label: "My Leaves" },
      { label: "Leave Details", active: true },
    ];
    if (this.id) {
      this.getLeaveDetails(this.id);
    }
  }

  // Method to fetch employee data (already implemented as per your code)
  async getEmployee() {
    (await this.service.getEmployee()).subscribe((res) => {
      this.employeeData = res?.data;

      // Concatenate firstName and lastName into fullName
      this.employeeData.forEach((employee) => {
        if (employee.basicDetails) {
          employee.fullName = `${employee.basicDetails.firstName} ${employee.basicDetails.lastName}`;
        }
      });
    });
  }

  // Get full name from employeeData based on the approvalId
  getApprovalUserName(approvalId: string): string {
    const employee = this.employeeData.find((e) => e.id === approvalId); // Match ID
    return employee ? employee.fullName : "Unknown User"; // Return fullName or fallback
  }

  async getLeaveDetails(id) {
    this.apiService.startLoader();
    (await this.service.getLeavebyId(id)).subscribe(
      (res) => {
        this.leaveDetails = res;
        this.apiService.stopLoader();
      },
      (err) => {}
    );
  }

  async getLeaveType() {
    (await this.service.getLeaveType()).subscribe((res: any[]) => {
      this.leaveTypes = res;
      this.leaveTypes =
        res?.map((type) => ({
          id: type?.id,
          name: type?.name,
        })) || [];
    });
  }
  getTypeLabel(typeId: string): string {
    const type = this.leaveTypes?.find((leaveType) => leaveType?.id === typeId);
    return type ? type.name : "Unknown";
  }

  getFileExtension(fileSrc: string): string {
    return fileSrc?.split(".").pop().toLowerCase();
  }
  isPdfFile(fileSrc: string): boolean {
    return this.getFileExtension(fileSrc) === "pdf";
  }

  getFileName(fileSrc: string): string {
    return fileSrc ? fileSrc.split("/").pop() : "No Image";
  }

  getFileFormat(fileSrc: string): string {
    return fileSrc ? this.getFileExtension(fileSrc) : "png";
  }

  downloadFile(fileSrc: string): void {
    if (!fileSrc) {
      console.error("No file source provided for download.");
      return;
    }

    // Extract the file name from the URL
    const fileName = this.getFileName(fileSrc);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = fileSrc;

    // Set the download attribute to the file name to prompt download
    link.download = fileName || "downloaded_file";

    // Append link to the DOM, trigger download, and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // downloadFile(fileSrc: string): void {
  //   const link = document.createElement('a');
  //   link.href = fileSrc;

  //   const fileExtension = this.getFileExtension(fileSrc);
  //   if (fileExtension === 'pdf') {
  //     link.download = 'leave_document.pdf';
  //   } else {
  //     link.download = 'leave_image';
  //   }
  //   link.click();
  // }
}
