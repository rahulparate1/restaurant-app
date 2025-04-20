import { Component, Input } from "@angular/core";
import { PollsService } from "../polls.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import Swal from "sweetalert2";
import { rolesType } from "src/app/layouts/full/shared/constant";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-mark-poll",
  templateUrl: "./mark-poll.component.html",
  styleUrls: ["./mark-poll.component.css"],
})
export class MarkPollComponent {
  breadCrumbItems: Array<{}>;
  pollsData: any;
  // id: any;
  commentForm: FormGroup;
  loggedInUser: any;
  data: any;
  istoggleReply = true;
  showLike: boolean;
  pollDetails: any;
  pollsForm: any;
  user: any;
  employeeImage: any;
  employeeEmail: any;
  userId: any;
  companyId: any;
  selectedOptions: string[] = [];
  selectedOption: string = "";
  result: any[] = [];
  isEditingComment = false;
  isSubmitted: boolean = false;
  editingIndex: number | null = null;
  editingCommentIndex: number | null = null;
  pollResults: any[] = [];
  totalVotes: number = 0;
  designation: any;
  designationRole: { key: string; value: string }[];
  isPollOver: boolean = false; // New property to check if the poll is over

  @Input() pollId!: string; // Receive pollId from parent component


  constructor(
    private service: PollsService,
    private router: Router
  ) {
    this.designationRole = rolesType;
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.userId = this.user?.user?.id;
    this.companyId = this.user?.company?.id;
    let userData: any = localStorage?.getItem("payoutUser");
    this.designation = userData?.user?.roles[0];
    this.loggedInUser = JSON?.parse(userData);
    this.employeeImage = this.user?.employee?.basicDetails?.image;
    this.employeeEmail = this.user?.employee?.basicDetails?.email;
  }

  ngOnInit(): void {
    if (this.pollId) {
      this.getPolls(this.pollId);
    }
    // this.id = this.activeRoute.snapshot.paramMap.get("id");
    // if (this.id) {
    //   debugger
    //   this.getPolls(this.id);
    // }
    this.checkIfSubmitted();
  }

  checkIfSubmitted(): void {
    const submittedPolls = JSON.parse(
      localStorage.getItem("submittedPolls") || "[]"
    );
    // Check if the current poll ID exists in the submittedPolls array
    this.isSubmitted = submittedPolls.includes(this.pollId);
  }

  checkPollEndTime(): void {
    const currentDateTime = new Date();
    const endDateTime = new Date(this.pollDetails?.endDateTime);
    this.isPollOver = endDateTime < currentDateTime;
  }

  async getPolls(id: string) {
    // Fetch poll details logic
    (await this.service.getPollsdById(id)).subscribe(
      (res: any) => {
        this.pollDetails = res;
        this.checkPollEndTime(); // Check if the poll has ended
        this.processPollResults(); // Process poll results
      },
      (error) => {
        console.error("Error fetching poll details:", error);
      }
    );
  }

  submitPoll(): void {
    if (this.isSubmitted) {
      swalWithBootstrapButtons.fire({
        title: "You have already submitted your response!",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    let pollsObj: any = {};
    pollsObj.companyId = this.companyId;
    pollsObj.userId = this.userId;
    pollsObj.pollId = this.pollDetails?.id;
    pollsObj.userName = this.user?.user?.name; // Adding the userName here
    pollsObj.pollsTitle = this.pollDetails?.title;

    pollsObj.option = this.pollDetails.options.map((opt: any) => opt.option);
    if (this.pollDetails?.isMultiSelect) {
      if (this.selectedOptions.length === 0) {
        alert("Please select at least one option!");
        return;
      }
      // Include userName in the result object
      pollsObj.result = this.selectedOptions.map((option) => ({
        userId: this.userId,
        selection: option,
        userName: this.user?.user?.name, // Add userName here
        image: this.employeeImage,
        email: this.employeeEmail
      }));
    } else {
      if (!this.selectedOption) {
        alert("Please select an option!");
        return;
      }
      // Include userName in the result object
      pollsObj.result = [
        {
          userId: this.userId,
          selection: this.selectedOption,
          userName: this.user?.user?.name, // Add userName here
          image: this.employeeImage,
          email: this.employeeEmail
        },
      ];
    }

    swalWithBootstrapButtons.fire({
      title: "Are you sure you want to add?",
      icon: "warning",
      confirmButtonText: "Yes, Add!",
      cancelButtonText: "No, Cancel!",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.service.postResultPolls(pollsObj)).subscribe(
          (res: any) => {
            if (res) {
              // Mark poll as submitted
              const submittedPolls = JSON.parse(
                localStorage.getItem("submittedPolls") || "[]"
              );
              submittedPolls.push(this.pollId);
              localStorage.setItem(
                "submittedPolls",
                JSON.stringify(submittedPolls)
              );
              this.isSubmitted = true;

              swalWithBootstrapButtons.fire({
                title: "Poll submitted successfully!",
                icon: "success",
                confirmButtonText: "OK",
              });

              this.router.navigate(["/general-feed"]);
            }
          },
          (error) => {
            console.error("Error adding poll:", error);
          }
        );
      }
    });
  }

  // Extract and process poll results
  // processPollResults(): void {
  //   if (this.pollDetails?.resultPolls) {
  //     this.pollResults = this.pollDetails?.resultPolls?.map((poll: any) => {
  //       const totalVotesForPoll = poll?.result?.length;
  //       this.totalVotes += totalVotesForPoll;
  //       return {
  //         pollsTitle: poll?.pollsTitle,
  //         options: poll?.option,
  //         result: poll?.result,
  //         totalVotes: totalVotesForPoll,
  //       };
  //     });
  //   }
  // }
  processPollResults(): void {
    if (this.pollDetails?.resultPolls) {
      const pollMap = new Map();

      this.totalVotes = 0; // Reset total votes

      this.pollDetails.resultPolls.forEach((poll: any) => {
        if (!pollMap.has(poll.pollsTitle)) {
          pollMap.set(poll.pollsTitle, {
            pollsTitle: poll.pollsTitle,
            options: poll.option,
            result: [],
            totalVotes: 0,
          });
        }

        const existingPoll = pollMap.get(poll.pollsTitle);
        existingPoll.result = existingPoll.result.concat(poll.result || []);
        existingPoll.totalVotes += poll.result ? poll.result.length : 0;
        this.totalVotes += poll.result ? poll.result.length : 0;
      });

      this.pollResults = Array.from(pollMap.values());
    }
  }

  // Get vote count for each option
  getVoteCount(poll: any, option: string): number {
    return poll?.result.filter((vote: any) => vote?.selection === option)
      ?.length;
  }
}
