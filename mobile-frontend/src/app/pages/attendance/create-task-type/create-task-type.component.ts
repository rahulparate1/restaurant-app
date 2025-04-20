import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../attendance.service';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-create-task-type',
  templateUrl: './create-task-type.component.html',
  styleUrls: ['./create-task-type.component.css']
})
export class CreateTaskTypeComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  timesheetTaskTypeForm: FormGroup;
  id: any;
  timesheetTaskTypeData: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private service: AttendanceService
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Timesheet Task Type" },
      { label: "Add Timesheet Task Type", active: true },
    ];

    // Set country to India by default
    this.timesheetTaskTypeForm = this.fb.group({
      taskTypeTitle: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      taskTypeId: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ["", [Validators.required]]
    });
  }

  onSubmit() {
    if (this.timesheetTaskTypeForm.invalid) {
      return;
    }

    const timesheetTaskTypeData = this.timesheetTaskTypeForm.value;

    const taskTypeObj = {
      taskTypeTitle: timesheetTaskTypeData.taskTypeTitle,
      taskTypeId: timesheetTaskTypeData.taskTypeId,
      description: timesheetTaskTypeData.description,

    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the work location?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.service.updateTaskType(
                this.id,
                taskTypeObj
              )
            ).subscribe(() => {
              this.router.navigate([
                "/attendance/task-type-list",
              ]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the work location?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (
              await this.service.postTaskType(taskTypeObj)
            ).subscribe(() => {
              this.router.navigate([
                "/attendance/task-type-list",
              ]);
            });
          }
        });
    }
  }

  navigateToList() {
    this.router.navigate(["/attendance/task-type-list"]);
  }
}
