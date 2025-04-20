import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { EventServiceService } from "../events/event-service.service";
import { NewsfeedService } from "../newsfeed/newsfeed.service";
import { ApiService } from "src/app/services/api.service";
import { PollsService } from "../polls/polls.service";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { DOCUMENT } from "@angular/common";
import { NoticeService } from "../notice/notice.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

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
  selector: "app-general-feed",
  templateUrl: "./general-feed.component.html",
  styleUrls: ["./general-feed.component.css"],
})
export class GeneralFeedComponent implements OnInit {
  feedData: any[] = []; // To store the combined and sorted feed data
  filteredFeedData: any[] = [];
  selectedCategory: string = "all";
  errorMessage = ""; // To store error messages
  loggedInUser: any;
  userId: any;
  companyId: any;

  isSubmitted: boolean = false;
  selectedOptions: string[] = [];
  selectedOption: string = "";
  isModalOpen = false;

  offset: number = 0;
  limit: number = 10; // Example: 10 records per page
  pageNo: number = 1; // Starting page number
  direction = "";
  loading: boolean = false; // Track loading state
  // bread crumb items
  breadCrumbItems: Array<{}>;
  selectedItem: any; // To hold the selected item for the modal

  // Object to store counts for each category
  feedCounts = {
    all: 0,
    news: 0,
    event: 0,
    poll: 0,
    announcement: 0,
  };
  selectedPollId!: string;
  originalFeedData: any[] = []; // Store full data separately

  constructor(
    private service: EventServiceService,
    private newsfeedService: NewsfeedService,
    private apiService: ApiService,
    private pollsService: PollsService,
    private noticeService: NoticeService,
    private modalService: NgbModal,
    private router: Router, // Inject Router
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    let userData: any = localStorage?.getItem("payoutUser");
    this.loggedInUser = JSON?.parse(userData);
    this.userId = this.loggedInUser?.user?.id;
    this.companyId = userData?.user?.companyId;
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: "General Feed", active: true }];
    this.fetchGeneralFeed();
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

  onScrollDown(event: any) {
    this.pageNo++;
    this.fetchGeneralFeed();
    this.direction = "scroll down";
  }

  // Check if the poll has ended
  hasPollEnded(item: any): boolean {
    return item?.endDateTime && new Date(item.endDateTime) < new Date();
  }

  // Count votes for each option
  getVoteCount(item: any, option: string): number {
    if (!item?.resultPolls) return 0;

    return item.resultPolls.reduce((count: number, poll: any) => {
      return (
        count +
        poll.result.filter((res: any) => res.selection === option).length
      );
    }, 0);
  }

  getPollButtonLabel(item: any, loggedInUserId: string): string {
    if (item?.endDateTime && new Date(item.endDateTime) < new Date()) {
      return "View Poll Survey"; // Poll has ended
    }

    // Check if the user has already voted
    const hasUserVoted = item?.resultPolls?.some((poll: any) =>
      poll?.result?.some((res: any) => res.userId === loggedInUserId)
    );

    return hasUserVoted ? "View Poll Result" : "Submit Poll";
  }

  getUserSelection(item: any, loggedInUserId: string): string | null {
    const userPoll = item?.resultPolls?.find((poll: any) =>
      poll?.result?.some((res: any) => res.userId === loggedInUserId)
    );

    if (userPoll) {
      const userResult = userPoll.result.find(
        (res: any) => res.userId === loggedInUserId
      );
      return userResult ? userResult.selection : null;
    }

    return null;
  }

  async fetchGeneralFeed(type: string = "all") {
    this.loading = true; // Start loading

    (
      await this.service.getGeneralFeed(type, this.offset, this.limit)
    ).subscribe(
      (res: any[]) => {
        if (type === "all") {
          this.originalFeedData = res; // Store full data when fetching 'all'
        }
        this.feedData = res; // Overwrite instead of appending
        this.calculateAttendancePercentageForEvents(this.feedData);
        this.updateFeedCounts();
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error("Error fetching feed:", error);
        this.errorMessage = "Failed to fetch feed data.";
      },
      () => {
        this.loading = false; // Stop loading
      }
    );
  }

  filterFeed(category: string) {
    this.selectedCategory = category;
    this.fetchGeneralFeed(category); // Fetch filtered data from backend
  }

  // Method to calculate counts
  updateFeedCounts() {
    // Use originalFeedData for 'all' count to ensure it remains correct
    this.feedCounts.all = this.originalFeedData.length;
    this.feedCounts.news = this.originalFeedData.filter(
      (item) => item?.type === "news"
    ).length;
    this.feedCounts.event = this.originalFeedData.filter(
      (item) => item?.type === "event"
    ).length;
    this.feedCounts.poll = this.originalFeedData.filter(
      (item) => item?.type === "poll"
    ).length;
    this.feedCounts.announcement = this.originalFeedData.filter(
      (item) => item?.type === "announcement"
    ).length;
  }

  shareEvent(item: any): void {
    const eventTitle = item?.title || item?.eventTitle || item?.noticeTitle;
    const eventDate = item?.startDate
      ? new Date(item.startDate).toDateString()
      : "Date not available";
    const eventLink = window.location.href; // You can generate a specific event URL if needed
    const shareText = `Check out this event: ${eventTitle} on ${eventDate}. More details: ${eventLink}`;

    if (navigator.share) {
      // Use Web Share API for mobile & modern browsers
      navigator
        .share({
          title: eventTitle,
          text: shareText,
          url: eventLink,
        })
        .then(() => console.log("Event shared successfully"))
        .catch((error) => console.error("Error sharing event:", error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard
        .writeText(shareText)
        .then(() => alert("Event details copied to clipboard!"))
        .catch((err) => console.error("Failed to copy text: ", err));
    }
  }

  calculateAttendancePercentageForEvents(feedData: any[]) {
    feedData.forEach((item) => {
      if (item?.type === "event") {
        const yesCount = item.yesCount || 0;
        const maybeCount = item.maybeCount || 0;
        const noCount = item.noCount || 0;

        // Estimate total expected attendees (Assumption: at least 20% more than responses)
        const estimatedTotal = Math.ceil(
          (yesCount + maybeCount + noCount) * 1.2
        );
        const responsesSum = yesCount + maybeCount + noCount;

        // Ensure we always have a valid denominator
        if (estimatedTotal === 0) {
          item.attendancePercentage = {
            yes: "0",
            maybe: "0",
            no: "0",
            unanswered: "100",
          };
        } else {
          const yesPercentage = (yesCount / estimatedTotal) * 100;
          const maybePercentage = (maybeCount / estimatedTotal) * 100;
          const noPercentage = (noCount / estimatedTotal) * 100;
          const unansweredPercentage =
            100 - (yesPercentage + maybePercentage + noPercentage);

          item.attendancePercentage = {
            yes: yesPercentage.toFixed(2),
            maybe: maybePercentage.toFixed(2),
            no: noPercentage.toFixed(2),
            unanswered: unansweredPercentage.toFixed(2),
          };
          console.log("item.attendancePercentage", item.attendancePercentage);
        }
      }
    });
  }

  // Like functionality for feed items (events, newsfeed, or polls)
  async like(itemId: string, itemData: any) {
    const userId = this.loggedInUser?.user?.id;
    if (!userId) {
      console.log("User is not logged in.");
      return;
    }

    // Determine the type of the item dynamically
    const itemType = itemData?.startDate
      ? "event"
      : itemData?.startDateTime
      ? "polls"
      : itemData?.pollsTitle
      ? "resultPolls"
      : "newsfeed";

    // Prevent "like" functionality on Polls
    if (itemType == "polls" || itemType == "resultPolls") {
      console.log("Cannot like a poll or resultPolls item.");
      return;
    }

    const userHasLiked = itemData?.likes?.includes(userId);

    // Optimistic update of likes
    if (userHasLiked) {
      itemData.likes = itemData?.likes.filter(
        (likeId: string) => likeId !== userId
      );
    } else {
      if (itemData?.likes) {
        itemData.likes.push(userId);
      } else {
        itemData["likes"] = [userId];
      }
    }

    const itemIndex = this.feedData.findIndex((item) => item?.id === itemId);
    if (itemIndex !== -1) {
      this.feedData[itemIndex].likes = itemData?.likes;
    }

    // Backend call based on inferred itemType
    if (itemType === "event") {
      (await this.service.updateEvent(itemId, itemData)).subscribe({
        next: (res: any) => {
          const updatedLikes = res?.likes || itemData?.likes;
          if (itemIndex !== -1) {
            this.feedData[itemIndex].likes = updatedLikes; // Sync with backend
          }
        },
        error: (error: any) => {
          console.error("Error updating event likes:", error);
        },
      });
    } else if (itemType === "newsfeed") {
      (await this.newsfeedService.updateNewsFeed(itemId, itemData)).subscribe({
        next: (res: any) => {
          const updatedLikes = res?.likes || itemData?.likes;
          if (itemIndex !== -1) {
            this.feedData[itemIndex].likes = updatedLikes; // Sync with backend
          }
        },
        error: (error: any) => {
          console.error("Error updating newsfeed likes:", error);
        },
      });
    }
  }

  async postAttendance(attendance: string, eventId: string) {
    const userId = this.loggedInUser?.user?.id;
    const userName = this.loggedInUser?.user?.name;

    if (!userId || !userName) {
      console.error("User ID or Name not found");
      return;
    }

    // Find the event index so we can update it in the array
    const eventIndex = this.feedData.findIndex((e: any) => e.id === eventId);
    if (eventIndex === -1) {
      console.error("Event not found");
      return;
    }
    let event = this.feedData[eventIndex];

    // Ensure attendance properties are defined
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

    event.isUpdating = true;

    // Optimistically update counts
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

    // Update the attendanceByUser array
    const existingAttendanceIndex = event.attendanceByUser.findIndex(
      (user: any) => user.userId === userId
    );
    if (existingAttendanceIndex !== -1) {
      event.attendanceByUser[existingAttendanceIndex] = {
        userId,
        userName,
        attendanceStatus: attendance,
      };
    } else {
      event.attendanceByUser.push({
        userId,
        userName,
        attendanceStatus: attendance,
      });
    }

    // Recalculate percentages for the full feed and force Angular to update the UI
    this.calculateAttendancePercentageForEvents(this.feedData);
    // Reassign the feedData array so change detection notices the update
    this.feedData = [...this.feedData];
    this.filterFeed(this.selectedCategory);
    this.cdr.detectChanges();

    // Prepare the updated event object for the API call
    const updatedEvent = {
      yesCount: event.yesCount,
      noCount: event.noCount,
      maybeCount: event.maybeCount,
      attendanceByUser: [...event.attendanceByUser],
    };

    (await this.service.updateEvent(eventId, updatedEvent)).subscribe(
      (response: any) => {
        // Merge the response into the event
        event = { ...event, ...response };
        this.feedData[eventIndex] = event;
        // Recalculate percentages for the entire feed
        this.calculateAttendancePercentageForEvents(this.feedData);
        this.filterFeed(this.selectedCategory);
        event.isUpdating = false;
        // Reassign to trigger change detection
        this.feedData = [...this.feedData];
        this.cdr.detectChanges();
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
        this.calculateAttendancePercentageForEvents(this.feedData);
        this.filterFeed(this.selectedCategory);
        event.isUpdating = false;
        this.feedData = [...this.feedData];
        this.cdr.detectChanges();
      }
    );
  }

  navigateToDetails(item: any): void {
    if (item?.type === "poll") {
      // Polls data
      if (item?.id) {
        this.router.navigate(["/polls/poll-details/" + item?.id]);
      } else {
        console.error("Polls ID is missing!");
      }
    } else if (item?.type === "event") {
      // Event data
      if (item?.id) {
        this.router.navigate(["/event/event-details/" + item?.id]);
      } else {
        console.error("Event ID is missing!");
      }
    } else if (item?.type === "announcement") {
      // Notice data
      if (item?.id) {
        this.router.navigate(["/notice/notice-details/" + item?.id]);
      } else {
        console.error("Notice ID is missing!");
      }
    } else if (item?.type === "news") {
      // Newsfeed data
      if (item?.id) {
        this.router.navigate(["/newsfeed/details/" + item?.id]);
      } else {
        console.error("Newsfeed ID is missing!");
      }
    } else {
      console.error("Unknown item type or missing ID!");
    }
  }

  // Method to open the modal
  openModal(centerDataModal: any): void {
    this.modalService.open(centerDataModal, { centered: true });
  }

  // Method to navigate to the respective form
  navigateTo(action: string, modal: any): void {
    if (action === "event") {
      this.router.navigate(["/event/event-form"]); // Navigate to the event form
    } else if (action === "newsfeed") {
      this.router.navigate(["/newsfeed/form"]); // Navigate to the newsfeed form
    } else if (action === "polls") {
      this.router.navigate(["/polls/create-poll"]); // Navigate to the poll form
    } else if (action === "notice") {
      this.router.navigate(["/notice/create-notice"]); // Navigate to the poll form
    }
    modal.dismiss(); // Close the modal after navigation
  }

  /**
   * Check if an option is already selected for a poll
   */
  isOptionSelected(item: any, option: string): boolean {
    // Find the current user's result
    const userResult = item?.result?.find(
      (result) => result?.userId === this.userId
    );
    return userResult?.selection === option;
  }

  openMarkPoll(id: string, content: any): void {
    this.selectedPollId = id; // Set the poll ID before opening the modal
    this.modalService.open(content, { size: "lg", backdrop: "static" });
  }

  navigateToEdit(item: any): void {
    if (item?.startDateTime) {
      // Polls data
      if (item?.id) {
        this.router.navigate(["/polls/create-poll/" + item?.id]);
      } else {
        console.error("Polls ID is missing!");
      }
    } else if (item?.type) {
      // Newsfeed data
      if (item?.id) {
        this.router.navigate(["/newsfeed/form/" + item?.id]);
      } else {
        console.error("Newsfeed ID is missing!");
      }
    } else if (item?.eventTitle) {
      // Event data
      if (item?.id) {
        this.router.navigate(["/event/event-form/" + item?.id]);
      } else {
        console.error("Event ID is missing!");
      }
    } else if (item?.noticeTitle) {
      // Event data
      if (item?.id) {
        this.router.navigate(["/notice/create-notice/" + item?.id]);
      } else {
        console.error("Notice ID is missing!");
      }
    } else {
      console.error("Unknown item type or missing ID!");
    }
  }

  deleteItem(item: any): void {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure? You won't be able to revert this!",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          this.apiService.startLoader();

          const handleSuccess = () => {
            this.apiService.stopLoader();
            this.document.location.reload(); // Reload the page to refresh data
          };

          const handleError = (err: any) => {
            console.error("Error deleting item:", err);
            this.apiService.stopLoader();
          };

          // Use the type flag to determine which delete service to call.
          if (item?.type === "poll" && item?.id) {
            (await this.pollsService.deletePolls(item.id)).subscribe(
              handleSuccess,
              handleError
            );
          } else if (item?.type === "event" && item?.id) {
            (await this.service.deleteEvent(item.id)).subscribe(
              handleSuccess,
              handleError
            );
          } else if (item?.type === "announcement" && item?.id) {
            (await this.noticeService.deleteNotice(item.id)).subscribe(
              handleSuccess,
              handleError
            );
          } else if (item?.type === "news" && item?.id) {
            (await this.newsfeedService.deleteNewsFeed(item.id)).subscribe(
              handleSuccess,
              handleError
            );
          } else {
            console.error("Unknown item type or missing ID!");
            this.apiService.stopLoader();
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }

  downloadFile(fileSrc: string): void {
    const link = document.createElement("a");
    link.href = fileSrc;

    const fileExtension = this.getFileExtension(fileSrc);
    link.download =
      fileExtension === "pdf" ? "notice_document.pdf" : "notice_image";
    link.click();
  }

  isPdfFile(fileSrc: string): boolean {
    return this.getFileExtension(fileSrc) === "pdf";
  }

  getFileExtension(fileSrc: string): string {
    if (!fileSrc) {
      return "";
    }
    const parts = fileSrc.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    // Use Google Drive viewer for PDF preview
    if (this.isPdfFile(url)) {
      const driveViewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
      )}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(driveViewerUrl);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openPdf(pdfUrl: string): void {
    if (pdfUrl && this.isPdfFile(pdfUrl)) {
      // You can replace this with any working CORS proxy URL
      const proxyUrl = "https://thingproxy.freeboard.io/fetch/";
      const targetUrl = pdfUrl;
      const proxiedUrl = proxyUrl + targetUrl;

      fetch(proxiedUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch PDF");
          }
          return response.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        })
        .catch((error) => {
          console.error("Error opening PDF:", error);
        });
    } else {
      console.error("Invalid PDF URL or URL is not a PDF");
    }
  }
}
