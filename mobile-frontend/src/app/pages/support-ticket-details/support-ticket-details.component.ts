import { Component, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SupportServiceService } from "../support-service.service";
import { SupportStatusList } from "full/shared/constant";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { EmployeeManagementService } from "../employee-management/employee-management.service";
import { ApiService } from "src/app/services/api.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-support-ticket-details",
  templateUrl: "./support-ticket-details.component.html",
  styleUrls: ["./support-ticket-details.component.css"],
})
export class SupportTicketDetailsComponent {
  supportDetailsData: any;
  id: any;
  commentForm: FormGroup;
  assignTicketForm: FormGroup;
  user: any;
  designation: any;
  loggedInUser: any;
  isEditingComment = false;
  editingCommentIndex: number | null = null;

  adminUsersList: any;

  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor(
    private activeRoute: ActivatedRoute,
    private service: SupportServiceService,
    private employeeManagementService: EmployeeManagementService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
    this.designation = this.user?.user?.roles[0];
    const firstName = this.user?.employee?.basicDetails?.firstName || "";
    const lastName = this.user?.employee?.basicDetails?.lastName || "";
    this.loggedInUser = `${firstName} ${lastName}`.trim();
    this.id = this.activeRoute.snapshot.paramMap.get("id");

    this.breadCrumbItems = [
      { label: "Support" },
      { label: "Support Ticket Details", active: true },
    ];
    if (this.id) {
      this.getSupport(this.id);
    }
    this.getAdminUsersList();
    this.commentForm = this.formBuilder.group({
      commentText: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ]),
    });

    this.assignTicketForm = this.formBuilder.group({
      assignee: [null, [Validators.required]],
    });
  }

  async getSupport(id) {
    (await this.service.getSupportById(id)).subscribe(
      (res) => {
        this.supportDetailsData = res;
      },
      (error: any) => {
        console.error("Error fetching news feeds details:", error);
      }
    );
  }

  getStatusClass(status: string | number): string {
    const statusObj = this.supportDetailsData.find(
      (s) => s.id === status.toString()
    );
    return statusObj ? statusObj.className : "";
  }

  getStatusLabel(statusId: string | number): string {
    const statusObj = SupportStatusList.find(
      (s) => s.id === statusId?.toString()
    );
    return statusObj ? statusObj.label : "Unknown";
  }

  async postComment() {
    const commentText = this.commentForm.value.commentText;
    if (this.commentForm.invalid) {
      return;
    }

    const commentObj: any = {
      commentText,
      userId: this.user?.user?.id,
      commentedBy: this.loggedInUser,
      commentDate: new Date(),
      userImage: this.loggedInUser?.employee?.basicDetails?.image,
    };

    if (!this.supportDetailsData.comments) {
      this.supportDetailsData.comments = [];
    }

    // If editing an existing comment, update it; otherwise, add a new comment at the top
    if (this.isEditingComment && this.editingCommentIndex !== null) {
      this.supportDetailsData.comments[this.editingCommentIndex] = commentObj;
    } else {
      // Add new comment at the beginning (top of the list)
      this.supportDetailsData.comments.unshift(commentObj);
    }

    // Only update the comments part of the exit process
    const updatedSupportTicket = {
      comments: this.supportDetailsData.comments,
    };

    if (this.commentForm.status !== "INVALID" && this.id) {
      this.apiService.startLoader();

      // Send only the updated comment data
      (
        await this.service.updateSupport(this.id, updatedSupportTicket)
      ).subscribe(
        () => {
          this.apiService.stopLoader();
          this.commentForm.reset();
          this.isEditingComment = false;
          this.editingCommentIndex = null;
        },
        (error: any) => {
          console.error("Error posting/updating comment:", error);
          this.apiService.stopLoader();
        }
      );
    }
  }

  async deleteComment(index) {
    if (index >= 0 && index < this.supportDetailsData.comments.length) {
      const removedComment = this.supportDetailsData.comments.splice(
        index,
        1
      )[0];
      this.apiService.startLoader();
      (
        await this.service.updateSupport(this.id, this.supportDetailsData)
      ).subscribe(
        (res) => {
          this.apiService.stopLoader();
          // Reload the page after the comment is deleted
          this.document.location.reload();
        },
        (error) => {
          console.error("Error deleting comment:", error);
          this.apiService.stopLoader();
          // If there's an error, restore the removed comment
          this.supportDetailsData.comments.splice(index, 0, removedComment);
        }
      );
    } else {
      console.error("Invalid index provided for deletion.");
    }
  }

  editComment(index: number) {
    const comment = this.supportDetailsData.comments[index];
    this.commentForm.patchValue({
      commentText: comment.commentText,
    });
    this.isEditingComment = true;
    this.editingCommentIndex = index;
  }

  cancelEdit() {
    this.commentForm.reset();
    this.isEditingComment = false;
    this.editingCommentIndex = null;
  }

  async assignTicket() {
    const selectedAssignee = this.assignTicketForm.value.assignee;
    console.log("Form Assignee Value:", selectedAssignee); // Debugging

    if (this.assignTicketForm.invalid || !selectedAssignee) {
      console.error("Form is invalid or no assignee selected.");
      return;
    }

    const userId = this.user?.user?.id;
    const userName = this.loggedInUser; // Adjust based on your user structure

    if (!userId) {
      console.error("User is not logged in.");
      return;
    }
    // Fetch previous ticket data before updating
    (await this.service.getSupportById(this.id)).subscribe({
      next: async (previousData) => {
        if (!previousData) {
          console.error("Error: Unable to fetch previous ticket data.");
          return;
        }
        // Extract previous assignee safely
        const previousAssignee =
          previousData.assignee && previousData.assignee.name
            ? `${previousData.assignee.name} (${
                previousData.assignee.username || "No Username"
              })`
            : "Unassigned";
        const newAssignee = `${
          selectedAssignee.fullName || selectedAssignee.firstName || "Unknown"
        } (${selectedAssignee.username.trim()})`.trim();

        // Create activity log object
        const activityLog = {
          userId: userId,
          userName: userName,
          ticketId: previousData.id,
          previousAssignee: previousAssignee,
          newAssignee: newAssignee,
          action: `Assignee changed from ${previousAssignee} to ${newAssignee}`,
          timestamp: new Date().toISOString(),
        };

        // Construct assignee object
        let assigneeObj = {
          assignee: {
            id: selectedAssignee.id,
            name:
              selectedAssignee.firstName +
              (selectedAssignee.lastName
                ? " " + selectedAssignee.lastName
                : ""),
            username: selectedAssignee.username,
            image: selectedAssignee.image || "default-profile.png", // Provide a default image if null
          },
        };

        // Update payload with required fields
        const updatePayload = {
          ...assigneeObj,
          activityLogs: [...(previousData.activityLogs || []), activityLog],
        };
        // Call update API
        (await this.service.updateSupport(this.id, updatePayload)).subscribe({
          next: () => {
            this.assignTicketForm.reset();
          },
          error: (error) => {
            console.error("Error updating support:", error);
          },
        });
      },
      error: (error) => {
        console.error("Error fetching previous ticket data:", error);
      },
    });
  }

  async getAdminUsersList() {
    (await this.employeeManagementService.getAdminUsers()).subscribe(
      (res: any) => {
        this.adminUsersList = res.map((user: any) => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName || ""}`.trim(),
        }));
      },
      (error) => {
        console.error("Error fetching employee details:", error);
      }
    );
  }
}
