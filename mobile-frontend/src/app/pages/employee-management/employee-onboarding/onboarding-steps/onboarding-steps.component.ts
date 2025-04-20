import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-steps',
  templateUrl: './onboarding-steps.component.html',
  styleUrls: ['./onboarding-steps.component.css'],
  providers: [CdkStepper,CdkStepperModule,]
})
export class OnboardingStepsComponent {

  breadCrumbItems: Array<{}>;
  isDisableOtherTabs = true;
  @Input() currentTab = 1;
  @Input() employee: any;

  constructor(public router: Router, private activeRoute: ActivatedRoute,) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Employee Onbording Form' }, { label: 'Form', active: true }];
    let employeeId = this.activeRoute.snapshot.paramMap.get("id");
    this.isDisableOtherTabs = employeeId == '0'
  }

  switchTab(tab){
    let employeeId = this.activeRoute.snapshot.paramMap.get("id");
    let link = '/employee/'+ '1' +'/' + tab;
      //bankDetails
    window.location.href = window.location.origin + link
    this.router.navigate([link])
    //TODO:Need to replace JS redirect with angular redirect.
  }

}
