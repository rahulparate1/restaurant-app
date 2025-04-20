import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsfeedService } from '../newsfeed.service';
import { ApiService } from 'src/app/services/api.service';
import { newsData } from '../add-newsfeed/newsFeedData';
import { DOCUMENT } from '@angular/common';
import Swal from "sweetalert2";

//Bootstrap Swal Button styling
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-newsfeed-details',
  templateUrl: './newsfeed-details.component.html',
  styleUrls: ['./newsfeed-details.component.css']
})
export class NewsfeedDetailsComponent implements OnInit {
  newsFeedData: any;
  id: any;
  newsfeedDetails: any;
  commentForm: FormGroup;
  loggedInUser: any;
  data: any;
  newsFeedShadow: any;
  istoggleReply = true;
  showLike: boolean;
  isEditingComment = false;
  newsFeedTypes = newsData.types;
  editingIndex: number | null = null;
  editingCommentIndex: number | null = null;
  breadCrumbItems: Array<{}>;


  toggleReply() {
    this.istoggleReply = !this.istoggleReply;
  }
  constructor(
    private service: NewsfeedService,
    private activeRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router

  ) {
    let userData: any = localStorage?.getItem('payoutUser');
    this.loggedInUser = JSON?.parse(userData);
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.breadCrumbItems = [
      { label: "NewsFeeed" },
      { label: "NewsFeeed Details", active: true },
    ];

    if (this.id) {
      this.getNewsFeed(this.id);
    }

    // Initialize the comment form
    this.commentForm = this.formBuilder.group({
      commentText: ['', [Validators.required]],
    });
  }

  // Fetch the newsfeed details
  async getNewsFeed(id) {
    (await this.service.getNewsFeedById(id)).subscribe(
      (res: any) => {
        this.newsfeedDetails = res;
      }
    );
  }

  getType(id: any) {
    return this.newsFeedTypes.find((x) => x.value == id)?.label;
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

    if (!this.newsfeedDetails.comments) {
      this.newsfeedDetails.comments = [];
    }

    if (this.isEditingComment && this.editingCommentIndex !== null) {
      this.newsfeedDetails.comments[this.editingCommentIndex] = commentObj;
    } else {
      this.newsfeedDetails.comments.push(commentObj);
    }
    this.newsfeedDetails.comments.sort((a, b) => {
      return new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime();
    });
    if (this.commentForm.status !== 'INVALID') {
      if (this.id) {
        // this.apiService.startLoader();
        (await this.service.updateNewsFeed(this.id, this.newsfeedDetails)).subscribe(
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
    if (index >= 0 && index < this.newsfeedDetails.comments.length) {
      const removedComment = this.newsfeedDetails.comments.splice(index, 1)[0];
      // this.apiService.startLoader();

      try {
        console.log('Making API call to delete the comment...');
        const res = await (await this.service.updateNewsFeed(this.id, this.newsfeedDetails)).toPromise();
        console.log('API response after deleting comment:', res);
          // this.apiService.stopLoader();
        this.document.location.reload();
      } catch (error) {
        console.error('Error deleting comment:', error);
        // this.apiService.stopLoader();
        this.newsfeedDetails.comments.splice(index, 0, removedComment);
        console.log('Restoring removed comment:', removedComment);
      }
    } else {
      console.error('Invalid index provided for deletion.');
    }
  }


  editComment(index: number) {
    const comment = this.newsfeedDetails.comments[index];
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

  async likeNewsFeed(newsFeedId: string, newsFeedData: any) {
    const userId = this.loggedInUser?.user?.id;

    if (!userId) {
      console.log("User is not logged in.");
      return;
    }

    // Check if the user has already liked the newsfeed
    const userHasLiked = newsFeedData?.likes?.includes(userId);

    // Optimistic update of likes
    if (userHasLiked) {
      newsFeedData.likes = newsFeedData?.likes.filter(
        (likeId: string) => likeId !== userId
      );
    } else {
      if (newsFeedData?.likes) {
        newsFeedData.likes.push(userId);
      } else {
        newsFeedData["likes"] = [userId];
      }
    }

    // Call the backend to update likes
    (await this.service.updateNewsFeed(newsFeedId, newsFeedData)).subscribe({
      next: (res: any) => {
        const updatedLikes = res?.likes || newsFeedData?.likes;
        newsFeedData.likes = updatedLikes; // Sync with backend
      },
      error: (error: any) => {
        console.error("Error updating newsfeed likes:", error);
      },
    });
  }

  shareNewsfeed() {
    const title = this.newsfeedDetails?.title;
    const newsFeedUrl = window.location.href;

    // Check if title is missing
    if (!title || title.trim() === "") {
      console.error("Newsfeed title is missing or empty!");
      Swal.fire({
        title: "Error!",
        text: "Newsfeed title is missing or empty. Please provide a valid Newsfeed title.",
        icon: "error",
      });
      return; // Prevent sharing without a valid title
    }

    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: `Check out this Newsfeed!`,
          url: newsFeedUrl,
        })
        .then(() => console.log("Newsfeed shared successfully"))
        .catch((error) => console.error("Error sharing Newsfeed:", error));
    } else {
      const shareMessage = `Check out this Newsfeed: ${title} \n\nVisit: ${newsFeedUrl}`;
      this.copyToClipboard(shareMessage);
    }
  }

   // Optional: Copy text to clipboard as a fallback
   copyToClipboard(message: string) {
    const textarea = document.createElement("textarea");
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    Swal.fire({
      title: "Newsfeed Link Copied!",
      text: "The newsfeed link has been copied to your clipboard.",
      icon: "success",
    });
  }

  navigateToEdit(id: any) {
    this.router.navigate(["/newsfeed/form/" + id]);
  }

  async deleteNewsfeed(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        // this.apiService.startLoader();
        // Calling Delete API
        if (result.value) {
          (await this.service.deleteNewsFeed(id)).subscribe((res) => {
            // this.apiService.stopLoader();
            this.router.navigate(["/general-feed"]);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // this.apiService.stopLoader();
        }
      });
  }
}
