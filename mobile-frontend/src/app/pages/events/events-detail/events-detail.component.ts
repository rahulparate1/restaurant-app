import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import { EventServiceService } from "../event-service.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/common";
import { ApiService } from "src/app/services/api.service";
import Swal from "sweetalert2";

//Bootstrap Swal Button styling
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-danger",
    cancelButton: "btn btn-light ms-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: "app-events-detail",
  templateUrl: "./events-detail.component.html",
  styleUrls: ["./events-detail.component.css"],
})
export class EventsDetailComponent {
  eventDetailsData: any;
  id: any;
  yesUsers: string[] = [];
  noUsers: string[] = [];
  maybeUsers: string[] = [];

  commentForm: FormGroup;
  loggedInUser: any;
  istoggleReply = true;
  showLike: boolean;
  isEditingComment = false;
  editingIndex: number | null = null;
  editingCommentIndex: number | null = null;
  breadCrumbItems: Array<{}>;

  constructor(
    private activeRoute: ActivatedRoute,
    private service: EventServiceService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    let userData: any = localStorage?.getItem("payoutUser");
    this.loggedInUser = JSON?.parse(userData);
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Event" },
      { label: "Event Details", active: true },
    ];

    if (this.id) {
      this.getEvent(this.id);
    }

    // Initialize the comment form
    this.commentForm = this.formBuilder.group({
      commentText: ["", [Validators.required]],
    });
  }

  async getEvent(id) {
    (await this.service.getEventbyId(id)).subscribe(
      (res) => {
        this.eventDetailsData = res;
      },
      (error: any) => {
        console.error("Error fetching news feeds details:", error);
      }
    );
  }

  isButtonDisabled(item: any, status: string): boolean {
    if (!this.loggedInUser?.user?.id) {
      // Disable if the user is not logged in
      return true;
    }

    // Find the user's attendance in the current item
    const userAttendance = item?.attendanceByUser?.find(
      (user: any) => user.userId === this.loggedInUser?.user?.id
    );

    // If the attendance status matches the button status, disable it
    return userAttendance?.attendanceStatus === status;
  }

  async postComment() {
    const commentText = this.commentForm.value.commentText;

    if (this.commentForm.invalid) {
      return;
    }

    const commentObj: any = {
      commentText,
      userId: this.loggedInUser?.user?.id,
      userFirstName: this.loggedInUser?.employee?.basicDetails?.firstName,
      userLastName: this.loggedInUser?.employee?.basicDetails?.lastName,
      commentDate: new Date(),
      commentId: this.loggedInUser?.user?.id,
      userImage: this.loggedInUser?.employee?.basicDetails?.image,
      userEmail: this.loggedInUser?.employee?.basicDetails?.email,
    };
    if (!this.eventDetailsData.comments) {
      this.eventDetailsData.comments = [];
    }
    if (this.isEditingComment && this.editingCommentIndex !== null) {
      this.eventDetailsData.comments[this.editingCommentIndex] = commentObj;
    } else {
      this.eventDetailsData.comments.push(commentObj);
    }

    // Sort comments by date, newest first
    // this.eventDetailsData.comments.sort((a, b) => b.commentDate - a.commentDate);
   this.eventDetailsData.comments.sort((a, b) => {
  return new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime();
});

if (this.commentForm.status !== "INVALID") {
      if (this.id) {
        // this.apiService.startLoader();
        (
          await this.service.updateEvent(this.id, this.eventDetailsData)
        ).subscribe(
          () => {
            // this.apiService.stopLoader();
            this.commentForm.reset();
            this.isEditingComment = false;
            this.editingCommentIndex = null;
          },
          (error: any) => {
            console.error("Error posting/updating comment:", error);
            // this.apiService.stopLoader();
          }
        );
      }
    }
  }

  async deleteComment(index) {
    if (index >= 0 && index < this.eventDetailsData.comments.length) {
      Swal.fire({
        title: "Are you sure? You won't be able to revert this!",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      }).then(async (result) => {
        if (result.value) {
          const removedComment = this.eventDetailsData.comments.splice(
            index,
            1
          )[0];
          this.apiService.startLoader();
          try {
            const res = await (
              await this.service.updateEvent(this.id, this.eventDetailsData)
            ).toPromise();
            this.apiService.stopLoader();
            this.document.location.reload();
          } catch (error) {
            console.error("Error deleting comment:", error);
            this.apiService.stopLoader();
            this.eventDetailsData.comments.splice(index, 0, removedComment);
          }
        }
      });
    } else {
      console.error("Invalid index provided for deletion.");
    }
  }

  editComment(index: number) {
    const comment = this.eventDetailsData.comments[index];
    this.commentForm.patchValue({
      commentText: comment.commentText,
    });
    this.isEditingComment = true;
    this.editingCommentIndex = index;
  }

  closeDialog(): void {
    alert("Comment update canceled!");
  }

  cancel() {
    this.commentForm.reset();
    this.isEditingComment = false;
    this.editingCommentIndex = null;
  }

  async postAttendance(attendance: string, eventId: string) {
    const userId = this.loggedInUser?.user?.id;
    const userName = this.loggedInUser?.user?.name;

    if (!userId || !userName) {
      console.error("User ID or Name not found");
      return;
    }

    // Find the event (details data)
    const event = this.eventDetailsData;
    if (!event || event.id !== eventId) {
      console.error("Event not found or mismatched ID");
      return;
    }

    event.attendanceByUser = event.attendanceByUser || [];
    event.yesCount = event.yesCount || 0;
    event.noCount = event.noCount || 0;
    event.maybeCount = event.maybeCount || 0;

    const previousState = {
      yesCount: event.yesCount,
      noCount: event.noCount,
      maybeCount: event.maybeCount,
      userAttendance:
        event.attendanceByUser.find((user: any) => user.userId === userId) ||
        null,
    };

    // Optimistically disable the button
    event.isUpdating = true;

    // Update attendance counts optimistically
    if (attendance === "Yes") {
      if (previousState.userAttendance?.attendanceStatus === "No")
        event.noCount--;
      if (previousState.userAttendance?.attendanceStatus === "MayBe")
        event.maybeCount--;
      if (previousState.userAttendance?.attendanceStatus !== "Yes")
        event.yesCount++;
    } else if (attendance === "No") {
      if (previousState.userAttendance?.attendanceStatus === "Yes")
        event.yesCount--;
      if (previousState.userAttendance?.attendanceStatus === "MayBe")
        event.maybeCount--;
      if (previousState.userAttendance?.attendanceStatus !== "No")
        event.noCount++;
    } else if (attendance === "MayBe") {
      if (previousState.userAttendance?.attendanceStatus === "Yes")
        event.yesCount--;
      if (previousState.userAttendance?.attendanceStatus === "No")
        event.noCount--;
      if (previousState.userAttendance?.attendanceStatus !== "MayBe")
        event.maybeCount++;
    }

    const existingAttendanceIndex = event.attendanceByUser.findIndex(
      (user: any) => user.userId === userId
    );

    if (existingAttendanceIndex !== -1) {
      event.attendanceByUser[existingAttendanceIndex] = {
        userId: userId,
        userName: userName,
        attendanceStatus: attendance,
      };
    } else {
      event.attendanceByUser.push({
        userId: userId,
        userName: userName,
        attendanceStatus: attendance,
      });
    }

    const updatedEvent = {
      yesCount: event.yesCount,
      noCount: event.noCount,
      maybeCount: event.maybeCount,
      attendanceByUser: [...event.attendanceByUser], // Ensure attendanceByUser is a new reference
    };

    (await this.service.updateEvent(eventId, updatedEvent)).subscribe(
      (response: any) => {
        // Update local event object with backend response
        Object.assign(this.eventDetailsData, response);
        // Force Angular to detect changes
        this.cdr.detectChanges();
        event.isUpdating = false; // Re-enable the button
        // Refresh the attendance table data
        this.refreshAttendanceTable();
      },
      (error: any) => {
        console.error("Error updating attendance:", error);
        // Revert changes on failure
        event.yesCount = previousState.yesCount;
        event.noCount = previousState.noCount;
        event.maybeCount = previousState.maybeCount;

        if (previousState.userAttendance) {
          event.attendanceByUser[existingAttendanceIndex] =
            previousState.userAttendance;
        } else {
          event.attendanceByUser.pop();
        }
        event.isUpdating = false; // Re-enable the button on failure
        this.cdr.detectChanges();
      }
    );
  }
  refreshAttendanceTable() {
    // No need to assign to a new variable; just ensure the table is bound to `attendanceByUser`
    this.cdr.detectChanges(); // This forces Angular to detect changes if needed
  }

  async likeEvent(eventId: string, eventData: any) {
    const userId = this.loggedInUser?.user?.id;

    if (!userId) {
      console.log("User is not logged in.");
      return;
    }

    // Check if the user has already liked the event
    const userHasLiked = eventData?.likes?.includes(userId);

    // Optimistic update of likes
    if (userHasLiked) {
      eventData.likes = eventData?.likes.filter(
        (likeId: string) => likeId !== userId
      );
    } else {
      if (eventData?.likes) {
        eventData.likes.push(userId);
      } else {
        eventData["likes"] = [userId];
      }
    }

    // Call the backend to update likes
    (await this.service.updateEvent(eventId, eventData)).subscribe({
      next: (res: any) => {
        const updatedLikes = res?.likes || eventData?.likes;
        eventData.likes = updatedLikes; // Sync with backend
      },
      error: (error: any) => {
        console.error("Error updating event likes:", error);
      },
    });
  }

  // calculatePercentages() {
  //   const totalUsers = this.eventDetailsData?.attendanceByUser?.length || 0;
  //   const yesCount = this.eventDetailsData?.yesCount || 0;
  //   const maybeCount = this.eventDetailsData?.maybeCount || 0;
  //   const noCount = this.eventDetailsData?.noCount || 0;

  //   // Calculate unanswered count
  //   const answeredCount = yesCount + maybeCount + noCount;
  //   const unansweredCount = totalUsers - answeredCount;
  //   const unansweredPercentage =
  //     totalUsers > 0 && unansweredCount >= 0
  //       ? (unansweredCount / totalUsers) * 100
  //       : 0;

  //   // Round percentages to two decimal places
  //   const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

  //   return {
  //     yesPercentage: roundToTwoDecimals(
  //       totalUsers > 0 ? (yesCount / totalUsers) * 100 : 0
  //     ),
  //     maybePercentage: roundToTwoDecimals(
  //       totalUsers > 0 ? (maybeCount / totalUsers) * 100 : 0
  //     ),
  //     noPercentage: roundToTwoDecimals(
  //       totalUsers > 0 ? (noCount / totalUsers) * 100 : 0
  //     ),
  //     unansweredPercentage: roundToTwoDecimals(unansweredPercentage),
  //   };
  // }
  calculatePercentages() {
    const yesCount = this.eventDetailsData?.yesCount || 0;
    const maybeCount = this.eventDetailsData?.maybeCount || 0;
    const noCount = this.eventDetailsData?.noCount || 0;

    const responsesSum = yesCount + maybeCount + noCount;

    // Estimate total users based on at least 20% more than responses
    const estimatedTotal = Math.ceil(responsesSum * 1.2);

    // Function to round percentages
    const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

    // Avoid division by zero
    if (estimatedTotal === 0) {
      return {
        yesPercentage: 0,
        maybePercentage: 0,
        noPercentage: 0,
        unansweredPercentage: 100,
      };
    }

    // Calculate percentages
    const yesPercentage = (yesCount / estimatedTotal) * 100;
    const maybePercentage = (maybeCount / estimatedTotal) * 100;
    const noPercentage = (noCount / estimatedTotal) * 100;
    const unansweredPercentage = 100 - (yesPercentage + maybePercentage + noPercentage);

    return {
      yesPercentage: roundToTwoDecimals(yesPercentage),
      maybePercentage: roundToTwoDecimals(maybePercentage),
      noPercentage: roundToTwoDecimals(noPercentage),
      unansweredPercentage: roundToTwoDecimals(unansweredPercentage),
    };
  }


  shareEvent() {
    const eventTitle = this.eventDetailsData?.eventTitle;
    const eventUrl = window.location.href;

    // Check if eventTitle is missing
    if (!eventTitle || eventTitle.trim() === "") {
      console.error("Event title is missing or empty!");
      Swal.fire({
        title: "Error!",
        text: "Event title is missing or empty. Please provide a valid event title.",
        icon: "error",
      });
      return; // Prevent sharing without a valid title
    }

    if (navigator.share) {
      navigator
        .share({
          title: eventTitle,
          text: `Check out this event!`,
          url: eventUrl,
        })
        .then(() => console.log("Event shared successfully"))
        .catch((error) => console.error("Error sharing event:", error));
    } else {
      const shareMessage = `Check out this event: ${eventTitle} \n\nVisit: ${eventUrl}`;
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
      title: "Event Link Copied!",
      text: "The event link has been copied to your clipboard.",
      icon: "success",
    });
  }

  navigateToEdit(id: any) {
    this.router.navigate(["/event/event-form/" + id]);
  }

  async deleteEvent(id) {
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
          (await this.service.deleteEvent(id)).subscribe((res) => {
            this.apiService.stopLoader();
            this.router.navigate(["/general-feed"]);
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }
}
