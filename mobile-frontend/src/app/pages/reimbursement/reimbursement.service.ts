import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Injectable({
  providedIn: "root",
})
export class ReimbursementService {
  reimbursement(id: any) {
    throw new Error("Method not implemented.");
  }
  constructor(private apiService: ApiService) {}
  async postReimbursements(data: any) {
    return await this.apiService.commonPost("/reimbursements", data);
  }
  async updateReimbursements(id: any, data: any) {
    return await this.apiService.commonPatch("/reimbursements/" + id, data);
  }

  async updateReimbursementByApproved(data: { id: string; comment: string }) {
    return await this.apiService.commonPatch(
      `/reimbursements/approve/${data.id}`,
      { comment: data.comment }
    );
  }

  async updateReimbursementByRejected(data: { id: string; comment: string }) {
    return await this.apiService.commonPatch(
      `/reimbursements/reject/${data.id}`,
      { comment: data.comment }
    );
  }

  getReimbursementByIdInclude(id: any) {
    let include = { include: [{ relation: "user" }] };
    return this.apiService.commonGet("/reimbursements/" + id, include);
  }

  async getReimbursements() {
    return await this.apiService.commonGet("/reimbursements");
  }

  deleteReimbursement(id: number) {
    return this.apiService.commonDelete("/reimbursements/" + id);
  }

  getReimbursementbyId(id: any) {
    return this.apiService.commonGet("/reimbursements/" + id);
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage(
      "/reimbursements/image/" + id,
      file
    );
  }

  async getJson(file: any) {
    return await this.apiService.commonPostImage(
      "/reimbursements/getJson",
      file
    );
  }

  getReimbursementForInclude() {
    let include = { include: [{ relation: "user" }] };
    return this.apiService.commonGet("/reimbursements/", include);
  }

  async getReimbursementFilter(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet("/reimbursements", query);
  }

  async getReimbursementForEmployee(
    offset: number,
    limit: number,
    search: any
  ) {
    let query = {
      offset: offset,
      limit: limit,
      where: search,
    };
    return await this.apiService.commonGet("/reimbursements", query);
  }

  async getReimbursementSummary() {
    return await this.apiService.commonGet("/reimbursements/summary");
  }
}
