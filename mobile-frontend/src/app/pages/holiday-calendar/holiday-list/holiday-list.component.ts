import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HolidayServiceService } from '../holiday-service.service';
import { State } from 'country-state-city';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.css']
})
export class HolidayListComponent {
  searchTitle: string = '';
  selectedState: any = '';
  states: any[] = [];
  filteredHolidayData: any[] = [];
  holidayData: any[] = [];
  dataSource: any;
  paginator: any;
    user: any;
  designation: string = '';
  breadCrumbItems: ({ label: string; active?: undefined; } | { label: string; active: boolean; })[];

  constructor(
    private service: HolidayServiceService,
    private activeRoute: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,

  ) { 
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.employee?.designation;
  }

  data: any;
  id: any;
  showNoDataFoundMessage: boolean = false;

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Holiday' }, { label: 'Holidays List', active: true }];
    this.getHolidayList();
    this.loadStates();
  }

  async getHolidayList() {
    this.apiService.startLoader();
    (await this.service.getHoliday()).subscribe((res: any[]) => {
      this.holidayData = res;
      this.filteredHolidayData = [...this.holidayData];
      this.apiService.stopLoader();
    });
  }


  filterHolidays() {
    this.filteredHolidayData = [
      ...this.holidayData.filter((item) =>
        item.title.toLowerCase().includes(this.searchTitle.toLowerCase())
      ),
    ];
  }

  goToEdit(id) {
    this.router.navigate(['holiday/form/' + id])

  }


  async loadStates() {
    this.states = await State.getStatesOfCountry('IN');
    console.log(this.states);
  }



  filterByState() {
    if (this.selectedState) {
      this.filteredHolidayData = this.holidayData.filter(holiday =>
        holiday.state.toLowerCase() === this.selectedState.toLowerCase()
      );
    } else {
      this.filteredHolidayData = [...this.holidayData];
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
            this.getHolidayList();
            this.router.navigate(['holiday/list']);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  }



  holiday() {
    this.router.navigate(['holiday/form']);

  }
}



