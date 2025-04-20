import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/services/api.service";
import { SupportServiceService } from "../support-service.service";
import { DndDropEvent } from "ngx-drag-drop";
import { SupportStatusList } from "full/shared/constant";

@Component({
  selector: "app-support-kanban",
  templateUrl: "./support-kanban.component.html",
  styleUrls: ["./support-kanban.component.css"],
})
export class SupportKanbanComponent implements OnInit {
  user: any;
  id: any;
  loggedInUser: any;
  userName: any;

  supportList: any[] = [];
  supportStatusList: any = SupportStatusList;

  // bread crumb items
  breadCrumbItems: Array<{}>;

  resolvedTickets: Task[];
  rejectedTickets: Task[];
  requestedTickets: Task[];
  inProcessTickets: Task[];
  closedTickets: Task[];

  constructor(
    private service: SupportServiceService,
    private activeRoute: ActivatedRoute,
    public router: Router,
    private apiService: ApiService
  ) {
    let userData: any = localStorage?.getItem("payoutUser");
    this.loggedInUser = JSON?.parse(userData);
    const firstName =
      this.loggedInUser?.employee?.basicDetails?.firstName || "";
    const lastName = this.loggedInUser?.employee?.basicDetails?.lastName || "";
    this.userName = `${firstName} ${lastName}`.trim();
  }

  ngOnInit() {
    this.id = this.activeRoute.snapshot.paramMap.get("id");
    this.breadCrumbItems = [
      { label: "Support" },
      { label: "Kanban Board", active: true },
    ];

    this.getSupportList();
  }

  async getSupportList() {
    (await this.service.getSupport()).subscribe(
      (res: any) => {
        this.supportList = Array.isArray(res?.data) ? res?.data : [];
        this._fetchData(); // Call _fetchData() after data is set
      },
      (error: any) => {
        console.error("Error fetching support list:", error);
      }
    );
  }

  private _fetchData() {
    if (!Array.isArray(this.supportList)) {
      console.error("supportList is not an array:", this.supportList);
      return;
    }

    //Initialize all ticket lists before modifying them
    this.requestedTickets = [];
    this.inProcessTickets = [];
    this.resolvedTickets = [];
    this.closedTickets = [];
    this.rejectedTickets = [];

    this.supportList?.forEach((t) => {
      const status = t?.status?.toString();
      if (status === "1") this.requestedTickets?.push(t);
      else if (status === "2") this.inProcessTickets?.push(t);
      else if (status === "3") this.resolvedTickets?.push(t);
      else if (status === "4") this.closedTickets?.push(t);
      else if (status === "5") this.rejectedTickets?.push(t);
    });
  }

  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  onDrop(event: DndDropEvent, filteredList?: any[], targetStatus?: string) {
    if (filteredList && event?.dropEffect === "move") {
      let index = event?.index ?? filteredList?.length;
      this.removeFromOtherLists(event?.data); // Remove from other lists
      event.data.status = targetStatus; // Update status
      filteredList.splice(index, 0, event?.data); // Add to new list
      //Call API to update status in database
      this.updateSupportList(event?.data?.id, event?.data);
    }
  }

  async updateSupportList(supportId: string, updatedSupportData: any) {
    const userId = this.loggedInUser?.user?.id;
    const userName = this.loggedInUser?.user?.name; // Adjust based on your user structure

    if (!userId) {
      console.log("User is not logged in.");
      return;
    }

    const supportItemIndex = this.supportList?.findIndex(
      (item) => item?.id === supportId
    );
    if (supportItemIndex === -1) {
      console.log("Support item not found.");
      return;
    }

    const previousData = { ...this.supportList[supportItemIndex] };
    this.supportList[supportItemIndex] = { ...updatedSupportData, userId };

    // Create activity log object
    const activityLog = {
      userId: userId, // Logged-in user's ID
      userName: userName, // Logged-in user's name
      ticketId: previousData?.id, // ID of the support ticket before update
      previousStatus: previousData?.status, // Old status of the ticket
      newStatus: updatedSupportData?.status, // New status of the ticket
      action: `Status changed from ${previousData?.status} to ${updatedSupportData?.status}`,
      timestamp: new Date().toISOString(), // Timestamp of the action
    };

    // Send update and log to backend
    (
      await this.service.updateSupport(supportId, {
        ...this.supportList[supportItemIndex],
        activityLogs: [...(previousData?.activityLogs || []), activityLog], // Append log
      })
    ).subscribe({
      next: (res: any) => {
        this.supportList[supportItemIndex] = res || updatedSupportData;
        this._fetchData();
      },
      error: (error: any) => {
        console.error("Error updating support list:", error);
        this.supportList[supportItemIndex] = previousData;
        this._fetchData();
      },
    });
  }

  private removeFromOtherLists(task: any) {
    this.requestedTickets = this.requestedTickets?.filter(
      (t: any) => t?.id !== task?.id
    );
    this.rejectedTickets = this.rejectedTickets?.filter(
      (t: any) => t?.id !== task?.id
    );
    this.resolvedTickets = this.resolvedTickets?.filter(
      (t: any) => t?.id !== task?.id
    );
    this.inProcessTickets = this.inProcessTickets?.filter(
      (t: any) => t?.id !== task?.id
    );
    this.closedTickets = this.closedTickets?.filter(
      (t: any) => t?.id !== task?.id
    );
  }

  delete(event: any) {
    event.target.closest(".card .task-box")?.remove();
  }

  getStatusLabel(status: string | number): string {
    const statusObj = SupportStatusList?.find(
      (s) => s?.id === status?.toString()
    );
    return statusObj ? statusObj?.label : "Unknown";
  }

  getStatusClass(status: string | number): string {
    const statusObj = SupportStatusList?.find(
      (s) => s?.id === status?.toString()
    );
    return statusObj ? statusObj?.className : "";
  }

  // On Details/View button click
  goToDetails(id: any) {
    this.router.navigate(["/support-ticket-details/" + id]);
  }
}
