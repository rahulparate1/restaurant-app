import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent {
  timesheetForm!: FormGroup;
  user: any;
  employeeId: any;
  employeeName: any;
  employeeImage: any;
  employeeEmail: any;
  userId: any;
  companyId: any;
  id: any;
  maxDateTime: string;
  timesheetData: any;

  timesheetTaskTypes: any;
  // @Input() attendanceId!: string;
  @Output() closeModal = new EventEmitter<void>();
  taskList: { label: string; controlName: string }[] = [];

  constructor(
    private service: AttendanceService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.companyId = JSON.parse(
      localStorage.getItem("payoutUser")
    )?.company?.id;
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.userId = this.user?.user?.id;
    this.employeeId = this.user?.employee?.id;
    this.employeeName = this.user?.user?.name;
    this.employeeImage = this.user?.employee?.basicDetails?.image;
    this.employeeEmail = this.user?.employee?.basicDetails?.email;
  }

  ngOnInit(): void {
    // console.log('Received attendanceId in TimesheetComponent:', this.attendanceId);
    this.id = this.activeRoute.snapshot.paramMap.get("id");
console.log("this.id==>", this.id)
    this.timesheetForm = this.fb.group({
      date: [{ value: this.getCurrentDate(), disabled: true }], // Set current date as readonly
      taskDescription: ['', Validators.required],
      totalHours: [{ value: 0, disabled: true }],
    });

    this.taskList.forEach(task => {
      this.timesheetForm.addControl(task.controlName, new FormControl(0, Validators.min(0)));
    });
    this.calculateTotal();
    this.fetchTimesheetTaskTypes();
  }

  async fetchTimesheetTaskTypes() {
    (await this.service.getAllTimesheetTaskTypes()).subscribe(
      (res: any) => {
        if (res && Array.isArray(res)) {
          this.taskList = res.map((task: any) => ({
            label: task.taskTypeTitle, // API provides taskTypeTitle
            controlName: this.generateControlName(task.taskTypeTitle),
          }));

          // Add form controls dynamically after setting taskList
          this.taskList.forEach(task => {
            this.timesheetForm.addControl(task.controlName, new FormControl(0, Validators.min(0)));
          });

          console.log("Updated taskList:", this.taskList);
        }
      },
      (err) => {
        console.error("Error fetching task types:", err);
      }
    );
  }

  generateControlName(taskTypeTitle: string): string {
    return taskTypeTitle.toLowerCase().replace(/\s+/g, '');
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formats date as YYYY-MM-DD
  }

  calculateTotal(): void {
    let total = 0;
    let exceeded = false;
    let exceededControl: string | null = null;

    this.taskList.forEach(task => {
      let control = this.timesheetForm.get(task.controlName);
      let value = control?.value || 0;

      // Reset errors for all fields first
      control?.setErrors(null);

      // Only add to total if we haven't exceeded yet
      if (!exceeded) {
        total += value;
        if (total > 12) {
          exceeded = true;
          exceededControl = task.controlName; // Track the first field causing excess
        }
      } else {
        // If we've already exceeded, reset excess field values
        control?.setValue(0, { emitEvent: false });
      }
    });

    // Apply error ONLY to the field that caused the limit breach
    if (exceededControl) {
      this.timesheetForm.get(exceededControl)?.setErrors({ maxTotalExceeded: true });
    }

    // Ensure totalHours reflects the valid hours up to 12
    this.timesheetForm.patchValue({ totalHours: Math.min(total, 12) });
  }

  submitTimesheet(): void {
  if (this.timesheetForm.valid) {
    let employeeObj: any = {
      id: this.employeeId,
      name: this.employeeName,
      email: this.employeeEmail,
      image: this.employeeImage,
    };

    let timesheetObj: any = {
      companyId: this.companyId,
      employee: employeeObj,
      date: this.getCurrentDate(), // Ensure current date is submitted
      status: 3, // Assuming 3 is for 'Pending' status
      ...this.timesheetForm.getRawValue(), // Get form values including readonly fields
    };

    Swal.fire({
      title: 'Are you sure you want to submit the timesheet?',
      icon: 'warning',
      confirmButtonText: 'Yes, Submit!',
      cancelButtonText: 'No, Cancel!',
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.service.postTimesheet(timesheetObj)).subscribe(
          (res: any) => {
            Swal.fire('Success!', 'Timesheet submitted successfully!', 'success');
            this.timesheetForm.reset();
            this.closeModal.emit(); // ✅ Close modal after success
            this.router.navigate(['/attendance/timesheet-list-employee']); // Redirect after submit
          },
          (error) => {
            Swal.fire('Error', 'Error submitting timesheet. Please try again.', 'error');
          }
        );
      }
    });
  } else {
    Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
  }
}

postCancel() {
  this.router.navigate(["/attendance/dashboard"]);
}
}
