import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShiftService } from '../shift.service';
import { ApiService } from 'src/app/core/services/api.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-add-shift',
  templateUrl: './add-shift.component.html',
  styleUrls: ['./add-shift.component.css']
})
export class AddShiftComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  shiftForm: FormGroup;
  id: any;
  user: any;
  departments: any[] = [];
  employeeId: any;
  userId: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private shiftService: ShiftService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Shift" },
      { label: "Add Shift", active: true },
      this.user = JSON.parse(localStorage.getItem('payoutUser')),
      console.log('user', this.user),
      this.employeeId = this.user?.employee?.id,
      console.log('employeeId', this.employeeId),

    ];

    this.shiftForm = this.fb.group({
      shiftName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      fromTime: ['', [Validators.required]],
      toTime: ['', [Validators.required]],
      departments: ['', [Validators.required]],
      enableShiftMargin: [false],
      hoursBeforeShift: ['', [Validators.required]],
      hoursAfterShift: ['', [Validators.required]],
      ratePerDay: ['', [Validators.required]],
    });

    this.id = this.activeRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.getShiftDetails(this.id);
    }
  }

  // Fetch shift details by ID (vaishnavi)
  async getShiftDetails(id: string) {
    (await this.shiftService.getShiftById(id)).subscribe((res) => {
      this.shiftForm.patchValue({
        shiftName: res.shiftName,
        fromTime: res.fromTime,
        toTime: res.toTime,
        departments: this.departments,
        hoursBeforeShift: res.hoursBeforeShift,
        hoursAfterShift: res.hoursAfterShift,
        ratePerDay: res.ratePerDay
      });
    });
  }

  // On form submit (vaishnavi)
  onSubmit() {
    if (this.shiftForm.invalid) {
      return;
    }

    const shiftData = this.shiftForm.value;

    const shiftObj = {
      shiftName: shiftData.shiftName,
      fromTime: shiftData.fromTime,
      toTime: shiftData.toTime,
      departments: shiftData.departments,
      hoursBeforeShift: shiftData.hoursBeforeShift,
      hoursAfterShift: shiftData.hoursAfterShift,
      ratePerDay: shiftData.ratePerDay,
      employeeId: this.employeeId
    };

    if (this.id) {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to update the shift?",
          confirmButtonText: "Yes, Update!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.shiftService.updateShift(this.id, shiftObj)).subscribe(() => {
              this.router.navigate(["/shift/list"]);
            });
          }
        });
    } else {
      swalWithBootstrapButtons
        .fire({
          title: "Are you sure you want to add the shift?",
          confirmButtonText: "Yes, Add!",
          cancelButtonText: "No, Cancel!",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.value) {
            (await this.shiftService.addShift(shiftObj)).subscribe(() => {
              this.router.navigate(["/shift/list"]);
            });
          }
        });
    }
  }

  // On Cancel button click (vaishnavi)
  navigateToList() {
    this.router.navigate(["/shift/list"]);
  }
}