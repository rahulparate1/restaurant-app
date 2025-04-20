import { Component } from '@angular/core';
import { EmployeeManagementService } from '../../employee-management.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-details-view',
  templateUrl: './employee-details-view.component.html',
  styleUrls: ['./employee-details-view.component.css']
})
export class EmployeeDetailsViewComponent {

  id: any;
  employeeDetails: any;

  constructor(
    private employeeService: EmployeeManagementService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.getEmployeeDetails(this.id);
    }
  }

  async getEmployeeDetails(id) {
    (await this.employeeService.getEmployeeView(id)).subscribe(
      (res: any) => {
        this.employeeDetails = res?.data;
      }
    );
  }

}
