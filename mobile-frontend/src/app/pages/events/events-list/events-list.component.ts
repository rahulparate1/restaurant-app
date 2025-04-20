import { Component } from "@angular/core";
import { EventServiceService } from "../event-service.service";
import { ApiService } from "src/app/services/api.service";
import { Router } from "@angular/router";
import { rolesType } from "src/app/layouts/shared/constant";
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
  selector: "app-events-list",
  templateUrl: "./events-list.component.html",
  styleUrls: ["./events-list.component.css"],
})
export class EventsListComponent {
  designationRole: { key: string; value: string }[];
  designation: string = "";
  user: any;
  id: any;
  loggedInUser: any;

  eventsList: any[] = [];
  offset: number = 0;
  limit: number = 10; // Example: 10 records per page
  pageNo: number = 1; // Starting page number
  direction = "";
  loading: boolean = false; // Track loading state
  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor(
    private service: EventServiceService,
    public router: Router,
    private apiService: ApiService
  ) {
    let userData: any = localStorage?.getItem("payoutUser");
    this.loggedInUser = JSON?.parse(userData);
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Events" },
      { label: "Events List", active: true },
    ];
    this.designationRole = rolesType;
    this.loadEvents();
  }

  onScrollDown(event: any) {
    this.pageNo++;
    this.loadEvents();
    this.direction = "scroll down";
  }
  async loadEvents() {
    this.apiService.startLoader();
    if (!this.loading) {
      this.loading = true;
      (await this.service.getEvent(this.offset, this.limit)).subscribe(
        (res: any[]) => {
          this.eventsList.push(...res);
          this.loading = false;
          this.offset += this.limit;
          this.apiService.stopLoader();
        },
        (error: any) => {
          console.error("Error fetching event list:", error);
          this.loading = false;
          this.apiService.stopLoader();
        }
      );
    }
  }

  async postAttendance(attendance: string, eventId: string) {
    // Use the userId and userName from the loggedInUser object
    const userId = this.loggedInUser?.user?.id;
    const userName = this.loggedInUser?.user?.name; // Assuming loggedInUser has the name

    if (!userId || !userName) {
      console.error("User ID or Name not found");
      return;
    }

    // Find the event by ID
    const event = this.eventsList.find((e: any) => e.id === eventId);
    if (!event) {
      console.error("Event not found");
      return;
    }

    // Initialize attendanceByUser as an array if it's not already initialized
    event.attendanceByUser = event.attendanceByUser || [];

    // Initialize attendance counts if not already present
    event.yesCount = event.yesCount || 0;
    event.noCount = event.noCount || 0;
    event.maybeCount = event.maybeCount || 0;

    // Save the user's previous attendance and overall counts for reverting changes on failure
    const previousState = {
      yesCount: event.yesCount,
      noCount: event.noCount,
      maybeCount: event.maybeCount,
      userAttendance:
        event.attendanceByUser.find((user: any) => user.userId === userId) ||
        null,
    };

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

    // Update or add the user's attendance in the attendanceByUser array
    const existingAttendanceIndex = event.attendanceByUser.findIndex(
      (user: any) => user.userId === userId
    );
    if (existingAttendanceIndex !== -1) {
      // Update existing attendance
      event.attendanceByUser[existingAttendanceIndex] = {
        userId: userId,
        userName: userName,
        attendanceStatus: attendance,
      };
    } else {
      // Add new attendance entry
      event.attendanceByUser.push({
        userId: userId,
        userName: userName,
        attendanceStatus: attendance,
      });
    }

    // Prepare the updated event object for the API
    const updatedEvent = {
      yesCount: event.yesCount,
      noCount: event.noCount,
      maybeCount: event.maybeCount,
      attendanceByUser: event.attendanceByUser,
    };

    // Call the updateEvent API
    this.apiService.startLoader();
    (await this.service.updateEvent(eventId, updatedEvent)).subscribe(
      (response: any) => {
        // Update the local event object with the backend response
        Object.assign(event, response);
        this.apiService.stopLoader();
      },
      (error: any) => {
        console.error("Error updating attendance:", error);
        this.apiService.stopLoader();
        // Revert changes on failure
        event.yesCount = previousState.yesCount;
        event.noCount = previousState.noCount;
        event.maybeCount = previousState.maybeCount;
        // Revert attendanceByUser
        if (previousState.userAttendance) {
          event.attendanceByUser[existingAttendanceIndex] =
            previousState.userAttendance;
        } else {
          // If the user had no previous attendance, remove the last entry
          event.attendanceByUser.pop();
        }
      }
    );
  }

  async like(eventId: string, eventData: any) {
    const userId = this.loggedInUser?.user?.id;
    if (!userId) {
      console.log("User is not logged in.");
      return; // No action if user is not logged in
    }
    // Check if the user has already liked this event
    const userHasLiked = eventData?.likes?.includes(userId);

    // Optimistically update the likes array
    if (userHasLiked) {
      // Remove the like (optimistic UI update)
      eventData.likes = eventData?.likes.filter(
        (likeId: string) => likeId !== userId
      );
    } else {
      // Add the like (optimistic UI update)
      if (eventData?.likes) {
        eventData?.likes.push(userId);
      } else {
        eventData["likes"] = [userId];
      }
    }
    // Update the frontend UI with the new likes array
    const eventIndex = this.eventsList?.findIndex(
      (event) => event?.id === eventId
    );
    if (eventIndex !== -1) {
      this.eventsList[eventIndex].likes = eventData?.likes;
    }
    // Proceed to update the event's like data in the backend
    if (eventId) {
      this.apiService.startLoader();
      (await this.service.updateEvent(eventId, eventData)).subscribe(
        (res: any) => {
          this.apiService.stopLoader();
          // After successful update, sync the frontend with the backend data
          const updatedLikes = res?.likes || eventData?.likes; // Fall back to optimistic data if backend fails
          // const updatedLikes = res.likes; // Assuming `res.likes` contains the updated likes array from the backend
          const eventIndex = this.eventsList?.findIndex(
            (event) => event?.id === eventId
          );
          if (eventIndex !== -1) {
            this.eventsList[eventIndex].likes = updatedLikes; // Update frontend with the latest data from the backend
          }
        },
        (error: any) => {
          console.error("Error updating event like:", error);
          this.apiService.stopLoader();
        }
      );
    }
  }

  addEvent(): void {
    this.router.navigate(["/event/event-form"]);
  }

  // On Details/View button click
  goToDetails(id: any) {
    this.router.navigate(["event/event-details/" + id]);
  }

  goToEdit(id): void {
    this.router.navigate(["/event/event-form/" + id]);
  }
  // To delete the Event by Id
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
            this.loadEvents();
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.apiService.stopLoader();
        }
      });
  }
}
