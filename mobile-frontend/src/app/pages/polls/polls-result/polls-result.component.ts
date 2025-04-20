import { Component, Input } from '@angular/core';
import { PollsService } from '../polls.service';
import { ActivatedRoute } from '@angular/router';
import { rolesType } from 'src/app/layouts/full/shared/constant';


@Component({
  selector: 'app-polls-result',
  templateUrl: './polls-result.component.html',
  styleUrls: ['./polls-result.component.css']
})
export class PollsResultComponent {
  pollResults: any = null;
  totalVotes: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  pollId: string;
  id: any;
  breadCrumbItems: Array<{}>;
  user: any;
  designation: any;
  designationRole: { key: string; value: string; }[];


  constructor(private pollsService: PollsService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.designationRole = rolesType;
    this.id = this.route.snapshot.paramMap.get('id');
    this.breadCrumbItems = [{ label: 'Polls Details' }, { label: 'Polls', active: true }];
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.designation = this.user?.user?.roles[0];
   if(this.id){
    this.fetchPollResults(this.id);
   }

  }
async fetchPollResults(id: any) {
  this.isLoading = true;
  this.errorMessage = '';
  (await this.pollsService.getResultPolls(id)).subscribe((res: any[]) => {
    this.pollResults = res || [];
    this.isLoading = false;
    this.calculateTotalVotes();
  });
}



getVoteCount(poll: any, option: string): number {
  return poll?.result?.filter((res: any) => res?.selection === option)?.length;
}

calculateProgress(poll: any, option: string): number {
  const totalVotes = poll?.result?.length;
  const optionVotes = this.getVoteCount(poll, option);
  return totalVotes ? (optionVotes / totalVotes) * 100 : 0;
}

hasVotes(poll: any, option: string): boolean {
  return this.getVoteCount(poll, option) > 0;
}

calculateTotalVotes() {
  this.totalVotes = this.pollResults?.reduce((total, poll) => total + poll?.result?.length, 0);
  console.log("Total Votes:", this.totalVotes);
}
}


