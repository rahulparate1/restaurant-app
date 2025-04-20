import { Component, OnInit } from '@angular/core';
import { PollsService } from '../polls.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false
});
@Component({
  selector: 'app-polls-list',
  templateUrl: './polls-list.component.html',
  styleUrls: ['./polls-list.component.css']
})
export class PollsListComponent implements OnInit {
  searchTitle: string = '';
  states: any[] = [];
  filteredPollsData: any[] = [];
  pollsData: any[] = [];
  dataSource: any;
  paginator: any;
  user: any;
  designation: string = '';

  breadCrumbItems: ({ label: string; active?: undefined; } | { label: string; active: boolean; })[];
  constructor(
    private service: PollsService,
    private router: Router,
    private apiService: ApiService,
  ) {
      this.user = JSON.parse(localStorage.getItem('payoutUser'));
      this.designation = this.user?.employee?.designation;
    }

    data: any;
  id: any;
  showNoDataFoundMessage: boolean = false;

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'List' }, { label: 'Polls Details', active: true }];
    this.getPollsList();
  }


  async getPollsList() {
    const offset = 0;
    const limit = 10;
    this.apiService.startLoader();
    (await this.service.getPolls()).subscribe((res: any[]) => {
      this.pollsData = res;
      this.filteredPollsData = [...this.pollsData];
      this.apiService.stopLoader();
    });
  }


  filterPolls(): void {
    this.filteredPollsData = this.filteredPollsData.filter(feed =>
      feed.title.toLowerCase().includes(this.searchTitle.toLowerCase())
    );
  }


  goToEdit(id) {
    this.router.navigate(['polls/create-poll/' + id]);

  }


  addNewPoll(): void {
    this.router.navigate(['/polls/create-poll']);
  }


  async deletePolls(id: number) {
    swalWithBootstrapButtons.fire({
      title: "Are you sure, You won't be able to revert this?",
      icon: "warning",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "No, cancel!",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.service.deletePolls(id)).subscribe(res => {
          this.getPollsList(); // Refresh the list
          this.router.navigate(['polls/polls-list']);
        });
      }
    });
  }


  viewPoll(id) {
    this.router.navigate(['/polls/poll-details/' + id]);

}
}
