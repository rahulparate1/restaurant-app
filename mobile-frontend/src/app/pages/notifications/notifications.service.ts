import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private apiService: ApiService
  ) { }

  async deleteNotification(id: number) {
    return await this.apiService.commonDelete("/notifications/" + id);
  }

  getNotificationFilter(pageSize, pageNo, searchCriteria) {
    let query = {
      limit: 100,
      skip: 0,
      where: searchCriteria,
    };
    return this.apiService.commonGet("/notifications", query);
  }

 async getNotification() {
    return await this.apiService.commonGet("/notifications");
  }

  async getNotification1(offset: number, limit: number) {
    let query = {
      offset: offset,
      limit: limit,
    };
      return await this.apiService.commonGet("/notifications", query);
    }

  async markAsRead() {
    return await this.apiService.commonGet("/notifications/mark-read");
  }

  getNotificationbyId(id: any) {
    return this.apiService.commonGet("/notifications/" + id);
  }

  async updateNotification( id: any,data: any) {
    return await this.apiService.commonPatch(
      "/notifications/"+ id, data
    );
  }
}
