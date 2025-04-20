import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "src/app/core/services/api.service";


@Injectable({
  providedIn: "root",
})
export class ShiftService {
  constructor(private http: HttpClient, public apiService: ApiService) { }

  async addShift(data: any) {
    return await this.apiService.commonPost("/shifts", data);
  }

  async updateShift(id: any, data: any) {
    return await this.apiService.commonPatch("/shifts/" + id, data);
  }

  getShiftById(id: any) {
    return this.apiService.commonGet("/shifts/" + id);
  }


  async getShiftList1(offset: number, limit: number) {
    let query = {
      offset: offset,
      limit: limit,
    };
    return await this.apiService.commonGet('/shifts', query);
  }

  async getShiftList() {
    return await this.apiService.commonGet("/shifts");
  }


  async postImage(file: any, id) {
    return await this.apiService.commonPostImage(
      "/shifts/image/" + id,
      file
    );
  }

  async deleteActivity(id: any) {
    return await this.apiService.commonDelete("/shifts/" + id);
  }

  async getShiftListData(offset: number, limit: number, search: any) {

    let query = {
      offset: offset,
      limit: limit,
      where: search
    };
    return await this.apiService.commonGet("/shifts", query);
  }

}

