import { Component, Inject } from '@angular/core';
import { PollsService } from '../polls.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DOCUMENT } from '@angular/common';
import Swal from 'sweetalert2';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-polls-details',
  templateUrl: './polls-details.component.html',
  styleUrls: ['./polls-details.component.css'],
})
export class PollsDetailsComponent {
  breadCrumbItems: Array<{}>;
  pollsData: any;
  id: any;
  commentForm: FormGroup;
  loggedInUser: any;
  data: any;
  istoggleReply = true;
  showLike: boolean;
  pollDetails: any;
  pollsForm: any;
  user: any;
  userId: any;
  companyId: any;
  selectedOptions: string[] = [];
  selectedOption: string = '';
  result: any[] = [];
  isEditingComment = false;
  isSubmitted: boolean = false;
  editingIndex: number | null = null;
  editingCommentIndex: number | null = null;
  constructor(
    private service: PollsService,
    private activeRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.user = JSON.parse(localStorage.getItem('payoutUser'));
    this.userId = this.user?.user?.id;
    this.companyId= this.user?.company?.id;
    let userData: any = localStorage?.getItem('payoutUser');
    this.loggedInUser = JSON?.parse(userData);
  }

  ngOnInit(): void {

    this.id = this.activeRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.getPolls(this.id);
    }

    // Check if user has already submitted the poll
    const submittedPolls = JSON.parse(localStorage.getItem('submittedPolls') || '[]');
    this.isSubmitted = submittedPolls.includes(this.id);

       // Initialize the comment form
       this.commentForm = this.formBuilder.group({
        commentText: ['', [Validators.required]],
      });
  }

async getPolls(id: string) {
    // Fetch poll details logic
    (await this.service.getPollsdById(id)).subscribe(
      (res: any) => {
        this.pollDetails = res;
      },
      (error) => {
        console.error('Error fetching poll details:', error);
      }
    );
  }

submitPoll(): void {
  if (this.isSubmitted) {
    alert('You have already submitted your response!');
    return;
  }


    let pollsObj: any = {};
    pollsObj.companyId = this.companyId;
    pollsObj.pollId = this.pollDetails?.id;
    pollsObj.userName = this.user?.user?.name;
    pollsObj.pollsTitle = this.pollDetails.title;

    pollsObj.option = this.pollDetails.options.map((opt: any) => opt.option);
    if (this.pollDetails?.isMultiSelect) {
      if (this.selectedOptions.length === 0) {
        alert('Please select at least one option!');
        return;
      }
      pollsObj.result = this.selectedOptions.map((option) => ({
        userId: this.userId,
        selection: option,
      }));
    } else {
      if (!this.selectedOption) {
        alert('Please select an option!');
        return;
      }
      pollsObj.result = [
        {
          userId: this.userId,
          selection: this.selectedOption,
        },
      ];
    }

    Swal.fire({
      title: 'Are you sure you want to add?',
      icon: 'warning',
      confirmButtonText: 'Yes, Add!',
      cancelButtonText: 'No, Cancel!',
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        (await this.service.postResultPolls(pollsObj)).subscribe(
          (res: any) => {
            if (res) {
              // Mark poll as submitted
              const submittedPolls = JSON.parse(localStorage.getItem('submittedPolls') || '[]');
              submittedPolls.push(this.id);
              localStorage.setItem('submittedPolls', JSON.stringify(submittedPolls));
              this.isSubmitted = true;
              this.router.navigate(['polls/result/' + res.pollId]);
            }
          },
          (error) => {
            console.error('Error adding poll:', error);
          }
        );
      }
    });
  }


  // Submit the comment
   async submitComment() {
    if (this.commentForm.invalid) {
      return;
    }

    const newComment = {
      user: this.loggedInUser.name,
      text: this.commentForm.value.commentText,
      date: new Date(),
    };
    this.pollDetails.comments.push(newComment);

    // this.apiService.startLoader();
    (await this.service.updatePolls(this.pollDetails.id, this.pollDetails)).subscribe(
      (response) => {
        // this.apiService.stopLoader();
        this.commentForm.reset();
        console.log('Comment posted successfully!');
      },
      (error) => {
        console.error('Error posting comment:', error);
        // this.apiService.stopLoader();
      }
    );
  }



  async postComment() {
    const commentText = this.commentForm.value.commentText;

    if (this.commentForm.invalid) {
      return;
    }

    const commentObj: any = {
      commentText,
      userId: this.loggedInUser?.userId,
      userFirstName: this.loggedInUser?.employee?.basicDetails?.firstName,
      userLastName: this.loggedInUser?.employee?.basicDetails?.lastName,
      commentDate: new Date(),
      commentId: this.loggedInUser?.user?.id,
      userImage: this.loggedInUser?.employee?.basicDetails?.image,
    };

    if (!this.pollDetails.comments) {
      this.pollDetails.comments = [];
    }

    if (this.isEditingComment && this.editingCommentIndex !== null) {
      this.pollDetails.comments[this.editingCommentIndex] = commentObj;
    } else {
      this.pollDetails.comments.push(commentObj);
    }
    this.pollDetails.comments.sort((a, b) => {
      return new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime();
    });

    if (this.commentForm.status !== 'INVALID') {
      if (this.id) {
        // this.apiService.startLoader();
        (await this.service.updatePolls(this.id, this.pollDetails)).subscribe(
          () => {
            // this.apiService.stopLoader();
            this.commentForm.reset();
            this.isEditingComment = false;
            this.editingCommentIndex = null;
          },
          (error: any) => {
            console.error('Error posting/updating comment:', error);
            // this.apiService.stopLoader();
          }
        );
      }
    }
  }
  // Comment Delete API //
  async deleteComment(index) {
    if (index >= 0 && index < this.pollDetails.comments.length) {
      const removedComment = this.pollDetails.comments.splice(index, 1)[0];
      // this.apiService.startLoader();

      try {
        const res = await (await this.service.updatePolls(this.id, this.pollDetails)).toPromise();
        // this.apiService.stopLoader();
        this.document.location.reload();
      } catch (error) {
        // this.apiService.stopLoader();
        this.pollDetails.comments.splice(index, 0, removedComment);
        console.log('Restoring removed comment:', removedComment);
      }
    } else {
      console.error('Invalid index provided for deletion.');
    }
  }


  editComment(index: number) {
    const comment = this.pollDetails.comments[index];
    this.commentForm.patchValue({
      commentText: comment.commentText,
    });
    this.isEditingComment = true;
    this.editingCommentIndex = index;
  }


  closeDialog(): void {
    alert('Comment update canceled!');
  }

  cancelEdit() {
    this.commentForm.reset();
    this.isEditingComment = false;
    this.editingCommentIndex = null;
  }

  // cancelEdit() {
  //   this.router.navigate(['polls/list']);
  // }

  isPollActive(): boolean {
    const currentDateTime = new Date();
    const pollEndDateTime = new Date(this.pollDetails?.endDateTime);
    return currentDateTime < pollEndDateTime;
  }


  navigateToEdit(id: any) {
    this.router.navigate(["/polls/create-poll/" + id]);
  }

  async deletePoll(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        this.apiService.startLoader();
        // Calling Delete API
        if (result.value) {
          (await this.service.deletePolls(id)).subscribe((res) => {
            this.apiService.stopLoader();
            this.router.navigate(["/general-feed"]);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }

}









