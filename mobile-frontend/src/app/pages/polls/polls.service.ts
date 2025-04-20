import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Injectable({
  providedIn: "root",
})
export class PollsService {
  constructor(private apiService: ApiService) {}
  async getPolls() {
    return await this.apiService.commonGet("/polls");
  }

  async getPollsdById(id: any) {
    return await this.apiService.commonGet("/polls/" + id);
  }

  async postPolls(data: any) {
    return await this.apiService.commonPost("/polls", data);
  }

  async postResultPolls(data: any) {
    return await this.apiService.commonPost("/result_polls", data);
  }

  async getResultPolls(id: any) {
    let include = { include: [{ relation: "polls" }] };
    return await this.apiService.commonGet("/result_polls/" + id);
  }

  async updatePolls(id: any, data: any) {
    return await this.apiService.commonPatch("/polls/" + id, data);
  }

  deletePolls(id: number) {
    return this.apiService.commonDelete("/polls/" + id);
  }

  getPollsDetails(id: number) {
    return this.apiService.commonDelete("/polls/" + id);
  }

  async getPollsResults(id: any) {
    return await this.apiService.commonGet("/polls/" + id + "/results");
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage("/polls/image/" + id, file);
  }

  async postNotification(data: any) {
    return await this.apiService.commonPost("/notifications", data);
  }
}
