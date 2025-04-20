import { Component } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "app-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.css"],
})
export class ExplorerComponent {
  firstObjectKeys: string[];
  responseType: string;
  constructor(private apiService: ApiService) {}
  filterBy: string;
  aiResponse: string;
  loading: boolean = false;
  repositoryIdentifier: string = "";
  repositories: string[] = [
    "Common",
    "User",
    "Employee",
    "Attendance",
    "Department",
    "Payout",
    "SalaryStructure",
    "Holiday",
  ];
  ngOnInit(): void {}

  async search() {
    console.log("repositoryIdentifier ", this.repositoryIdentifier);
    if (this.filterBy) {
      if (!this.repositoryIdentifier || this.repositoryIdentifier == "Common") {
        this.loading = true;
        (
          await this.apiService.commonGet("/ai-query/" + this.filterBy)
        ).subscribe(
          (response) => {
            this.loading = false;
            console.log(response);
            this.processReponse(response);
          },
          (err) => {
            this.loading = false;
          }
        );
      } else {
        this.loading = true;
        (
          await this.apiService.commonGet(
            "/ai-query/" + this.repositoryIdentifier + "/" + this.filterBy
          )
        ).subscribe(
          (response) => {
            console.log(response);
            this.loading = false;
            this.processReponse(response);
          },
          (err) => {
            this.loading = false;
          }
        );
      }
      console.log(this.filterBy);
    }
  }
  processReponse(response) {
    this.responseType = Array.isArray(response) ? "array" : typeof response;
    if (this.responseType == "array") {
      if (response.length && response.length > 0) {
        this.firstObjectKeys = Object.keys(response[0]);
      }
      this.aiResponse = response;
    } else {
      this.aiResponse = JSON.stringify(response);
    }
  }
}
