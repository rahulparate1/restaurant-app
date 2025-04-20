import { Injectable } from '@angular/core';
import { ApiService } from "src/app/services/api.service";


@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  constructor(private apiService: ApiService) { }

  async getNotice(offset: number, limit: number) {
    const query = {
      offset: offset, // Offset for pagination
      limit: limit, // Limit for number of records
    };

    return this.apiService.commonGet("/notices", query);
  }

  async postNotice(data: any) {
    return await this.apiService.commonPost("/notices", data);
  }

  async updateNotice(id: any, data: any) {
    return await this.apiService.commonPatch("/notices/" + id, data);
  }

  deleteNotice(id: number) {
    return this.apiService.commonDelete("/notices/" + id);
  }

  getNoticeById(id: any) {
    return this.apiService.commonGet("/notices/" + id);
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage("/notices/image/" + id, file);
  }

  async noticesImages(id, index) {
    return await this.apiService.commonDelete(
      "/notices/gallery/" + id + "/" + index
    );
  }

  async getNoticeFilterForYearMonth(offset: number, limit: number, search: any) {
    let query: any = {
      offset: offset,
      limit: limit,
      where: search,
    };

    return this.apiService.commonGet("/notices", query);
  }

  async getWorkLocation(){
    return await this.apiService.commonGet(
      "/worklocations"
      );
  }

  async getDepartment() {
    return await this.apiService.commonGet('/departments');
  }
}
