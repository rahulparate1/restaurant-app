import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyConfigurationService } from '../company-configuration.service';

@Component({
  selector: 'app-pay-schedule-form',
  templateUrl: './pay-schedule-form.component.html',
  styleUrls: ['./pay-schedule-form.component.css']
})
export class PayScheduleFormComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  payScheduleForm: FormGroup;
  @Input() companyId: string;
  weekdays: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  selectedWeekdays: string[] = [];
  daysInMonthOptions: number[] = [];
  payOnOptions: number[] = [];
  showOrganisationDaysDropdown: boolean = false;
  showPayOnDayDropdown: boolean = false;
  payCompanyData: any;
  status: string;
  user: any;
  designation: any;

  constructor(
    private router: Router,
    private service: CompanyConfigurationService,
    private activeRoute: ActivatedRoute
  ) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Pay Schedule" },
      { label: "form", active: true },
    ];
    this.payScheduleForm = new FormGroup({
      selectedWeekdays: new FormControl([], [Validators.required]),
      daysInMonth: new FormControl('', [Validators.required]),
      payEmployeesOn: new FormControl('', [Validators.required]),
      organisationWorkingDay: new FormControl(''),
      payEmployeesOnDay: new FormControl(''),
    });

    this.populateDayOptions();
    this.getPayScheduleDetails();
  }

  get form() {
    return this.payScheduleForm.controls;
  }

  // Method to populate dropdowns for days
  populateDayOptions() {
    this.daysInMonthOptions = Array.from({ length: 31 }, (_, i) => i + 1);
    this.payOnOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  }

  // Get existing pay schedule details
  async getPayScheduleDetails() {
    let companyId = this.activeRoute.snapshot.paramMap.get('id');
    (await this.service.getCompanyDetails(companyId)).subscribe(
      (res) => {
        this.payCompanyData = res;
        if (this.payCompanyData?.payScheduleDetails) {
          const { daysInMonth, payEmployeesOn, organisationWorkingDay, payEmployeesOnDay, weekdays } = this.payCompanyData.payScheduleDetails;
          this.selectedWeekdays = [...new Set(this.selectedWeekdays)];
          this.selectedWeekdays = weekdays || [];
          this.payScheduleForm.patchValue({
            daysInMonth,
            payEmployeesOn,
            organisationWorkingDay,
            payEmployeesOnDay,
          });

          this.payScheduleForm.controls['selectedWeekdays'].setValue(this.selectedWeekdays);

          this.showOrganisationDaysDropdown = payEmployeesOn === 'organisationWorkingDays';
          this.showPayOnDayDropdown = payEmployeesOn === 'sameDayOfEveryMonth';

          if (payEmployeesOn === 'actualDayInMonth' || payEmployeesOn === 'lastWorkingDay') {
            this.payScheduleForm.controls['organisationWorkingDay'].setValue('');
            this.payScheduleForm.controls['payEmployeesOnDay'].setValue('');
          }
        }
      },
      (err) => console.error(err)
    );
  }

  // Handle checkbox selection for weekdays (ensuring uniqueness)
  onWeekdayChange(weekday: string, event: any) {
    if (event.target.checked) {
      this.selectedWeekdays.push(weekday);
    } else {
      this.selectedWeekdays = this.selectedWeekdays.filter(w => w !== weekday);
    }
    this.selectedWeekdays = [...new Set(this.selectedWeekdays)];
    this.payScheduleForm.controls['selectedWeekdays'].setValue(this.selectedWeekdays);
  }

  // Handle change in the "Calculate monthly salary based on" radio button
  onDaysInMonthChange() {
    const selectedValue = this.payScheduleForm.value.daysInMonth;
    this.showOrganisationDaysDropdown = selectedValue === 'organisationWorkingDays';

    if (selectedValue === 'actualDayInMonth' || selectedValue === 'lastWorkingDay') {
      this.payScheduleForm.controls['organisationWorkingDay'].setValue('');
      this.payScheduleForm.controls['payEmployeesOnDay'].setValue('');
    }
  }

  // Handle change in the "Pay on" radio button
  onPayOnChange() {
    const selectedValue = this.payScheduleForm.value.payEmployeesOn;
    this.showPayOnDayDropdown = selectedValue === 'sameDayOfEveryMonth';
    if (selectedValue === 'actualDayInMonth' || selectedValue === 'lastWorkingDay') {
      this.payScheduleForm.controls['organisationWorkingDay'].setValue('');
      this.payScheduleForm.controls['payEmployeesOnDay'].setValue('');
    }
  }

  // Submit form data
  async onSubmit() {
    if (this.payScheduleForm.invalid) {
      return;
    }

    const payScheduleObj = {
      daysInMonth: this.payScheduleForm.value.daysInMonth,
      payEmployeesOn: this.payScheduleForm.value.payEmployeesOn,
      weekdays: this.selectedWeekdays,
      organisationWorkingDay: this.payScheduleForm.value.organisationWorkingDay || null,
      payEmployeesOnDay: this.payScheduleForm.value.payEmployeesOnDay || null,
      status: 'completed'
    };

    const companyId = this.activeRoute.snapshot.paramMap.get('id');
    (await this.service.postEntity(payScheduleObj, companyId, 'payScheduleDetails')).subscribe(
      (res: any) => {
        if (res) {
          console.log('Pay schedule saved successfully', res);
          this.router.navigate(['/']);
        }
      },
      (err) => console.error('Error saving pay schedule', err)
    );
  }

  // Go back to the previous page
  goBack() {
    this.router.navigate(['/']);
  }
}







