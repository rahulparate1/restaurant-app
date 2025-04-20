import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, FormArray, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { State, City } from 'country-state-city'; // Using only State and City for fetching data
import Swal from 'sweetalert2';
import { HolidayServiceService } from '../holiday-service.service';
import { ApiService } from '../../../core/services/api.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.css']
})
export class HolidayComponent {
  holidayData: any;
  holidayForm: UntypedFormGroup;
  form: FormGroup;
  id: string;
  file: any;
  checkedReminder: boolean = false;
  image: any;
  holidayResp: any;
  cities: any = [];
  states: any = [];
  selectedState: any;
  selectedCity: any;
  hidden: boolean;
  hoveredDate: NgbDate;
  fromNGDate: NgbDate;
  toNGDate: NgbDate;
  selected: any;

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();
  @ViewChild('dp', { static: true }) datePicker: any;

  constructor(
    private fb: UntypedFormBuilder,
    private service: HolidayServiceService,
    private activeRoute: ActivatedRoute,
    private apiService: ApiService,
    public router: Router
  ) {

    this.form = this.fb.group({
      formlist: this.fb.array([])
    });
  }


  ngOnInit(): void {
    this.hidden = true
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    if (this.id) {
      this.getHoliday(this.id);
    }
    this.onCountryChange();
    this.addField();
  }

  async getHoliday(id: string) {
    (await this.service.getHolidayById(id)).subscribe((res) => {
      this.holidayData = res;
      const formlist = this.form.get('formlist') as UntypedFormArray;
      const firstHolidayFormGroup = formlist.at(0) as FormGroup;
      firstHolidayFormGroup.patchValue({
        state: this.holidayData.state,
        startDate: this.holidayData.startDate,
        endDate: this.holidayData.endDate,
        title: this.holidayData.title,
        description: this.holidayData.description,

      });

      this.image = this.holidayData?.image
    });
  }


  uploadLogo(event: any): void {
    this.file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => this.image = reader.result;
    reader.readAsDataURL(this.file);
  }

  async postAttachedFiles(id: string) {
    (await this.service.postImage(this.file, id)).subscribe(
      async (resp) => {
        if (resp) {
          this.form.reset();
          this.router.navigate(["holiday/list"]);
        }
      }
    );
  }

  postCancel() {
    this.router.navigate(["holiday/list"]);
  }

  async onCountryChange() {
    this.states = await State.getStatesOfCountry('IN');
  }

  onStateChange(index: number): void {
    const selectedState = this.formlist.at(index).get('state')?.value;


    if (selectedState) {
      this.cities = City.getCitiesOfState('IN', selectedState.isoCode);
    } else {
      this.cities = [];
    }
  }

  // On selecting city
  onCityChange(city: string): void {
    this.selectedCity = city;
  }

  // Comparing selected state
  compareState(item, selected) {
    return item.name == selected.name;
  }

  // Comparing selected city
  compareCity(item, selected) {
    return item.name == selected.name;
  }

  get formlist() {
    return this.form.get('formlist') as UntypedFormArray;
  }

  createFormGroup(): FormGroup {
    return this.fb.group({
      state: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.endDateValidator]],
      image: [''],
    });
  }


  // StartDate & endDate //
 endDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control?.parent?.get('startDate')?.value;
    const endDate = control?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Current date ko reset kar rahe hain hours, minutes, seconds ko zero karne ke liye

    // Agar end date current date se pehle hai, toh validation error
    if (end < currentDate) {
      return { endDateInPast: true };
    }

    // Agar end date start date se pehle hai, toh validation error
    if (end < start) {
      return { endDateBeforeStartDate: true };
    }

    // Agar start date aur end date same hain, toh validation error na ho
    if (start.getTime() === end.getTime()) {
      return null;
    }

    return null;
  }


  // Add a new form field //
  addField() {
    const formlist = this.form.get('formlist') as FormArray;
    formlist.push(this.createFormGroup());
    this.form.reset();

  }

  removeField(index: number) {
    const formlist = this.form.get('formlist') as FormArray;
    if (formlist.length > 1) {
      formlist.removeAt(index);
    } else {
      Swal.fire('Cannot delete the last field.');
    }
  }


  async postData(event) {
    let holidayContentObj = this.form.value;
    if (this.form.valid) {

      const holidayList = holidayContentObj.formlist;

      if (this.id) {
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
              this.apiService.startLoader();

              for (const holiday of holidayList) {
                (await this.service.updateHoliday(this.id, holiday)).subscribe(
                  (res: any) => {
                    this.apiService.stopLoader();
                    if (this.file) {
                      this.postAttachedFiles(this.id);
                    }
                    this.form.reset();
                    this.router.navigate(["holiday/list"]);
                  }
                );
              }
            }
          });
      } else {
        swalWithBootstrapButtons
          .fire({
            title: "Are you sure you want to add?",
            icon: "warning",
            confirmButtonText: "Yes, Add!",
            cancelButtonText: "No, Cancel!",
            showCancelButton: true,
          })
          .then(async (result) => {
            if (result.value) {
              this.apiService.startLoader();

              for (const holiday of holidayList) {
                (await this.service.postHoliday(holiday)).subscribe(
                  (res: any) => {
                    this.apiService.stopLoader();
                    this.holidayResp = res;
                    if (this.file) {
                      this.postAttachedFiles(this.holidayResp.id);
                    } else {
                      this.form.reset();
                      this.router.navigate(["holiday/list"]);
                    }
                  }
                );
              }
            }
          });
      }

    }
  }

  async deleteHoliday(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        icon: "warning",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "No, cancel!",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.service.deleteHoliday(id)).subscribe(res => {
            this.router.navigate(['holiday/form']);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }

}
