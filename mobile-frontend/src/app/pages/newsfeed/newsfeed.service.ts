import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsfeedService {

  constructor(private apiService: ApiService) { }

  async getNewsFeeds(offset: number, limit: number) {
    const query = {
      offset: offset,
      limit: limit
    };
    return await this.apiService.commonGet("/newsfeeds", query );
  }

  async getNewsFeedById(id: any){
    return await this.apiService.commonGet(
      "/newsfeeds/" +id
    );
  }

  async postNewsFeed(data: any) {
    return await this.apiService.commonPost("/newsfeeds", data);
  }

  async updateNewsFeed(id:any,data:any){
    return await this.apiService.commonPatch(
      "/newsfeeds/"+id,data
    );
  }

  deleteNewsFeed(id :number){
    return  this.apiService.commonDelete(
      "/newsfeeds/" +id

    );
  }

  getNewsfeedDetails(id :number){
    return  this.apiService.commonDelete(
      "/newsfeeds/" +id

    );
  }

  async postImage(file : any, id) {
    return await this.apiService.commonPostImage("/newsfeeds/image/" + id, file);
  }

  async postNotification(data: any) {
    return await this.apiService.commonPost("/notifications", data);
  }

  async getNotification() {
    return await this.apiService.commonGet("/notifications");
  }

  deleteNotification(id :number){
    return this.apiService.commonDelete("/notifications/"+id);
  }

}
