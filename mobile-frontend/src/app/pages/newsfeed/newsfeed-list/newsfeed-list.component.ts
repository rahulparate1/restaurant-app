import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

import Swal from 'sweetalert2';
import { NewsfeedService } from '../newsfeed.service';
import { newsData } from '../add-newsfeed/newsFeedData';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger ms-2',
  },
  buttonsStyling: false,
  allowOutsideClick: false
});

@Component({
  selector: 'app-newsfeed-list',
  templateUrl: './newsfeed-list.component.html',
  styleUrls: ['./newsfeed-list.component.css']
})
export class NewsfeedListComponent implements OnInit {
  searchTitle: string = '';
  selectedState: any = '';
  states: any[] = [];
  filteredNewsFeedData: any[] = [];
  newsFeedData: any[] = [];
  dataSource: any;
  paginator: any;
  user: any;
  designation: string = '';
  newsFeedTypes = newsData.types;
  breadCrumbItems: ({ label: string; active?: undefined; } | { label: string; active: boolean; })[];

  constructor(
    private service: NewsfeedService,
    private router: Router,
    private apiService: ApiService,
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.employee?.designation;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'NewsFeed' }, { label: 'NewsFeed List', active: true }];
    this.getNewsFeedListAppend();
  }

  async getNewsFeedListAppend() {
    const offset = 0;
    const limit = 10;
    this.apiService.startLoader();
    (await this.service.getNewsFeeds(offset, limit)).subscribe((res: any[]) => {
      this.newsFeedData = res;
      this.filteredNewsFeedData = [...this.newsFeedData];
      this.apiService.stopLoader();
    });
  }

  filterNewsFeed(): void {
    this.filteredNewsFeedData = this.newsFeedData.filter(feed =>
      feed.title.toLowerCase().includes(this.searchTitle.toLowerCase())
    );
  }

  goToEdit(id: number): void {
    this.router.navigate(['newsfeed/' + id]);
  }

  addNewsFeed(): void {
    this.router.navigate(['/newsfeed/form']);
  }

  async deleteNewsFeed(id: number) {
    Swal.fire({
      title: "Are you sure, You won't be able to revert this?",
      icon: "warning",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "No, cancel!",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.service.deleteNewsFeed(id)).subscribe(res => {
          this.getNewsFeedListAppend(); // Refresh the list
          this.router.navigate(['newsfeed/list']);
        });
      }
    });
  }

  getType(id: any) {
    return this.newsFeedTypes.find((x) => x.value == id)?.label;
  }

  goToDetail(id) {
    this.router.navigate(['/newsfeed/details/' + id]);
  }
}
