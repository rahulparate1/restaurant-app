import { Component } from "@angular/core";
import Swal from "sweetalert2";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LeaveManagementServiceService } from "../leave-management-service.service";
import { ImageExtensionsLeaves } from "../../../layouts/shared/constant";
import { forbiddenPreviousDayValidator } from "src/app/services/constants/forbidden-prev-day.validator";
import { ApiService } from "src/app/services/api.service";
// import { EmployeeService } from "./../../../../../../Web Portal/src/app/pages/employee/employee.service";
import { LeaveTypeService } from "../leavetype.service";
import { HolidayServiceService } from "../../holiday-calendar/holiday-service.service";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-apply-leave",
  templateUrl: "./apply-leave.component.html",
  styleUrls: ["./apply-leave.component.css"],
})
export class ApplyLeaveComponent {
  leaveForm: FormGroup;
  id: any;
  leaveData: any;
  leaveResp: any;
  file: any;

  // typeOptions = leaveData.types;
  leaveTypeData: any;
  leaveTypeId: string;
  leaveListData: any;

  minStartDate: Date = new Date();
  minEndDate: Date = new Date();
  today: string;
  currentDate = new Date();
  startDate: Date;
  endDate: Date;
  totalDays: number = 0;
  dayType: string = "full";
  private _isDateRangeSelected: boolean = false;
  totalLeaveDays: number = 0; // Total leave days

  // bread crumb items
  breadCrumbItems: Array<{}>;
  user: any;
  date;
  leaveBalance: any;
  lowBalanceMessage: string;
  userId: any;
  companyId: any;
  employeeData: any;
  managerList: any;
  type: any;
  employeeId: any;
  offset: number = 0;
  limit: number = 5;
  leaveDetails: any;
  employeeLeaveBalance: any;
  employeeSpecificData: any;
  leaveCounts: any;
  sickLeaveValue: number;
  casualValue: number;
  privilegeValue: number;
  filterBy: string = "";
  searchTerm: string = "";

  image: string | ArrayBuffer;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileError: any;

  holidays: any;

  isLoading: boolean = false;
  teammatesOnLeave: any[] = [];
  // department: string = ''; // Example department, replace with dynamic department if necessary
  currentDepartment: string = "";
  noData: boolean = false;

  totalLeaveBalance: number = 0;
  currentBooking: number = 0;
  balanceAfterBooking: number = 0;
  availableBalance: number = 0;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: LeaveManagementServiceService,
    private holidayService: HolidayServiceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService
  ) // private employeeService: EmployeeService
  {
    this.companyId = JSON.parse(
      localStorage.getItem("payoutUser")
    )?.company?.id;
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.userId = this.user?.user?.id;
    this.employeeId = this.user?.employee?.id;
    this.currentDepartment =
      this.user?.employee?.basicDetails?.department || "";
    this.today = new Date().toISOString().split("T")[0];
  }
  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Leaves" },
      { label: "Apply Leave", active: true },
    ];
    this.id = this.activeRoute.snapshot.paramMap.get("id");

    this.leaveForm = this.formBuilder.group({
      type: [null, Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      // dayType: ['', Validators.required],  // Add dayType here if it's missing
      description: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
      additionalDetails: [
        "",
        [Validators.minLength(5), Validators.maxLength(500)],
      ],
      approvals: [[], [Validators.required, Validators.minLength(1)]],
      // approvals: [[]],
    });

    // Apply the forbiddenPreviousDayValidator to endDate, using startDate for comparison
    this.leaveForm
      .get("endDate")
      .setValidators(
        forbiddenPreviousDayValidator(this.leaveForm.get("startDate"))
      );

    // Re-validate endDate whenever startDate changes
    this.leaveForm.get("startDate").valueChanges.subscribe(() => {
      this.leaveForm.get("endDate").updateValueAndValidity();
    });

    this.getEmployee();
    this.getLeaveTypesList();

    if (this.id?.length) {
      this.getLeave(this.id);
    }
    // Fetch the holidays
    this.getHoliday();
    // Load leave balance on component initialization
    this.loadLeaveBalance();
  }

  async loadLeaveBalance() {
    try {
      this.apiService.startLoader();

      // Fetch leave balance
      (await this.service.getEmployeeLeaveBalance(this.employeeId)).subscribe({
        next: (response) => {
          // Parse the total leave balance from the response and ensure it's a number
          this.totalLeaveBalance = parseFloat(response.totalLeaveBalance) || 0;
          // Call the method to calculate the available balance and balance after booking
          this.calculateBalance();
          this.apiService.stopLoader();
        },
        error: (err) => {
          console.error("Error fetching leave balance:", err);

          // Stop the loader on error
          this.apiService.stopLoader();
        },
      });
    } catch (error) {
      console.error("Error in loadLeaveBalance method:", error);

      this.apiService.stopLoader();
    }
  }
  // Calculate the available balance and balance after booking
  calculateBalance(): void {
    this.availableBalance = this.totalLeaveBalance; // Available balance
    this.balanceAfterBooking = this.availableBalance - this.currentBooking; // Balance after booking
  }

  async getLeave(id) {
    this.apiService.startLoader();
    (await this.service.getLeavebyId(id)).subscribe((res) => {
      this.apiService.stopLoader();
      const startDate = res?.startDate
        ? new Date(res.startDate).toISOString().slice(0, 10)
        : null;
      const endDate = res?.endDate
        ? new Date(res.endDate).toISOString().slice(0, 10)
        : null;

      this.leaveForm.patchValue({
        type: res?.type,
        startDate: startDate,
        endDate: endDate,
        description: res?.description,
        approvals: res?.approvals,
        duration: res?.duration,
      });
      this.image = res?.image;
    });
  }

  get isDateRangeSelected(): boolean {
    return this._isDateRangeSelected;
  }

  set isDateRangeSelected(value: boolean) {
    this._isDateRangeSelected = value;
  }
  onDateChange() {
    // Get the values of startDate and endDate from the form
    const startDate = this.leaveForm.get("startDate").value
      ? new Date(this.leaveForm.get("startDate").value)
          .toISOString()
          .split("T")[0] // Extract only the date part
      : null;
    const endDate = this.leaveForm.get("endDate")?.value
      ? new Date(this.leaveForm.get("endDate").value)
          .toISOString()
          .split("T")[0] // Extract only the date part
      : null;
    // Check if both startDate and endDate are defined
    if (startDate && endDate) {
      if (endDate >= startDate) {
        // If both dates are valid and endDate is greater than or equal to startDate, calculate the duration
        this.calculateDuration();
        this.loadLeaveBalance(); // Recalculate balance after booking

        // Fetch teammates on leave for the selected date range
        this.fetchTeammatesOnLeave();
      } else {
        // Handle case where endDate is before startDate (you can display an error or prompt)
        console.error("End date cannot be before start date");
      }
    } else if (startDate && !endDate) {
      // If only startDate is selected, you can show a prompt or handle the case
      // Optionally, disable the endDate input until startDate is selected
      console.log("Start date selected, please select the end date.");
      // Optionally, you could enable/disable endDate field here:
      // this.leaveForm.get('endDate').enable();
    }
  }

  async fetchTeammatesOnLeave() {
    const startDate = this.leaveForm.get("startDate")?.value;
    const endDate = this.leaveForm.get("endDate")?.value;

    if (startDate && endDate && this.currentDepartment) {
      // Format dates to 'YYYY-MM-DD' without time (remove time part)
      const formattedStartDate = new Date(startDate)
        .toISOString()
        .split("T")[0]; // 'YYYY-MM-DD'
      const formattedEndDate = endDate
        ? new Date(endDate).toISOString().split("T")[0]
        : null; // 'YYYY-MM-DD'

      (
        await this.service.getTeammatesOnLeave(
          startDate,
          endDate,
          this.currentDepartment
        )
      ).subscribe(
        (data: any[]) => {
          this.teammatesOnLeave = data;
        },

        (error) => {
          console.error("Error fetching teammates on leave:", error);
          this.teammatesOnLeave = [];
        }
      );
    }
  }

  // Date Change Handlers
  onStartDateChange() {
    this.calculateDuration();
  }

  onEndDateChange() {
    this.calculateDuration();
  }

  // Fetching the Shift list (vaishnavi)
  async getHoliday() {
    (await this.holidayService.getHoliday()).subscribe((res: any) => {
      this.holidays = res;
      this.calculateDuration();
    });
  }

  async calculateDuration(): Promise<void> {
    const startDate = new Date(this.leaveForm.get("startDate").value);
    const endDate = new Date(this.leaveForm.get("endDate").value);

    if (startDate && endDate && endDate >= startDate) {
      let totalDays = 0;
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const currentDateStr = currentDate.toISOString().split("T")[0];

        // Check if the current day is not a weekend or a holiday
        const isHoliday = this.holidays.some((holiday) => {
          const holidayStartDate = new Date(holiday.startDate);
          const holidayEndDate = new Date(holiday.endDate);

          // Check if current date falls within the holiday range
          return (
            currentDate >= holidayStartDate && currentDate <= holidayEndDate
          );
        });

        if (
          currentDate.getDay() !== 0 && // Sunday
          currentDate.getDay() !== 6 && // Saturday
          !isHoliday // Exclude holidays
        ) {
          totalDays++;
        }
        // Increment the current date by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.totalLeaveDays = totalDays; // Total days excluding weekends and holidays
      this.currentBooking = totalDays; // Set currentBooking to the calculated number of days
      this.calculateBalance();
    } else {
      this.totalLeaveDays = 0;
      this.currentBooking = 0; // If the dates are invalid or not provided, set currentBooking to 0
      this.calculateBalance(); // Call calculateBalance to update balance after booking
    }
  }

  // async calculateDuration(): Promise<void> {
  //   const startDate = new Date(this.leaveForm.get('startDate').value);
  //   const endDate = new Date(this.leaveForm.get('endDate').value);

  //   if (startDate && endDate && endDate >= startDate) {
  //     let totalDays = 0;
  //     let currentDate = new Date(startDate);

  //     while (currentDate <= endDate) {
  //       const currentDateStr = currentDate.toISOString().split('T')[0];

  //       // Check if the current day is not a weekend or a holiday
  //       const isHoliday = this.holidays.some(holiday => {
  //         const holidayStartDate = new Date(holiday.startDate);
  //         const holidayEndDate = new Date(holiday.endDate);

  //         // Check if current date falls within the holiday range
  //         return currentDate >= holidayStartDate && currentDate <= holidayEndDate;
  //       });

  //       if (
  //         currentDate.getDay() !== 0 && // Sunday
  //         currentDate.getDay() !== 6 && // Saturday
  //         !isHoliday // Exclude holidays
  //       ) {
  //         totalDays++;
  //       }

  //       // Increment the current date by 1 day
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }

  //     this.totalLeaveDays = totalDays; // Total days excluding weekends and holidays
  //   } else {
  //     this.totalLeaveDays = 0;
  //   }
  // }

  // Get the total number of days between startDate and endDate

  getTotalDays(startDate: Date, endDate: Date): number {
    let days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    return days;
  }

  async getEmployee() {
    (await this.service.getEmployee()).subscribe((res) => {
      this.employeeData = res?.data;

      // Concatenate firstname and lastname into fullName
      this.employeeData.forEach((employee) => {
        if (employee.basicDetails) {
          employee.fullName = `${employee.basicDetails.firstName} ${employee.basicDetails.lastName}`;
        }
      });
    });
  }

  async postLeaveData(event) {
    const startDate: Date = new Date(this.leaveForm.value.startDate);
    const endDate: Date = new Date(this.leaveForm.value.endDate);
    // const timeDifference = endDate.getTime() - startDate.getTime();
    let leaveContentObj: any = {};
    leaveContentObj.title = this.leaveForm.value.title;
    leaveContentObj.type = this.leaveForm.value.type;
    leaveContentObj.startDate = startDate.toISOString(); // ensure ISO format
    leaveContentObj.endDate = endDate.toISOString(); // ensure ISO format
    leaveContentObj.description = this.leaveForm.value.description;
    leaveContentObj.additionalDetails = this.leaveForm.value.additionalDetails;
    leaveContentObj.comment = this.leaveForm.value.comment;
    leaveContentObj.approvals = this.leaveForm.value.approvals;
    leaveContentObj.leaveTypeId = this.leaveTypeId;
    leaveContentObj.userId = this.userId;
    leaveContentObj.employeeId = this.employeeId;
    leaveContentObj.companyId = this.companyId;
    leaveContentObj.duration = this.totalLeaveDays;
    leaveContentObj.status = 3; // Assuming 3 is for 'Pending' status

    if (this.leaveForm.status !== "INVALID") {
      if (this.id) {
        // Update existing leave data
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
              // Update the leave data
              (
                await this.service.updateLeave(this.id, leaveContentObj)
              ).subscribe(async (res: any) => {
                // Post attached files if present
                if (this.file) {
                  this.postAttachedFiles(this.id);
                }
                this.router.navigate(["leave-management/leaves-list"]);
              });
            }
          });
      } else {
        // Post new leave data
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
              // Post new leave data
              (await this.service.postLeave(leaveContentObj)).subscribe(
                async (res: any) => {
                  // Send notification after successful leave request
                  let notificationObj: any = {};
                  notificationObj.title = "Leave Apply";
                  notificationObj.description =
                    "Leave Apply" + this.leaveForm?.value?.title;

                  (
                    await this.service.postNotification(notificationObj)
                  ).subscribe(async (notificationRes) => {
                    if (notificationRes) {
                      this.apiService.stopLoader();
                      this.router?.navigate(["leave-management/leaves-list"]);
                    }
                  });

                  // Post attached files if present
                  if (this.file) {
                    this.postAttachedFiles(res.id);
                  }
                  this.router.navigate(["leave-management/leaves-list"]);
                }
              );
            }
          });
      }
    }
  }

  async getLeaveTypesList() {
    (await this.service.getLeaveType()).subscribe((res: any[]) => {
      this.leaveTypeData = res;
    });
  }

  postCancel() {
    this.router?.navigate(["leave-management/leaves-list"]);
  }

  uploadLogo(event: any) {
    this.fileError = null;
    this.image = null;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (!ImageExtensionsLeaves.includes(fileExtension)) {
        this.file = null;
        this.fileError =
          "Please upload an image with a valid extension (jpg, png, svg, jpeg, wabp).";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.file = null;
        this.fileError = "File size exceeds 5MB limit.";
        return;
      }

      // If file passes all checks, set fileExtensionError to false
      this.fileExtensionError = false;

      // Read the file and display it as image preview
      const reader = new FileReader();
      reader.onload = (e) => (this.image = reader.result);
      reader.readAsDataURL(file);

      // Set the file to class variable
      this.file = file;
    }
  }

  removeImage(): void {
    this.image = null;
    this.fileError = null;

    // Clear the file input
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  async postAttachedFiles(id) {
    (await this.service.postImage(this.file, id)).subscribe(async (resp) => {
      if (resp) {
        this.leaveForm.reset();
        this.router.navigate(["leave-management/leaves-list"]);
      }
    });
  }
}
