import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Injectable({
  providedIn: "root",
})
export class EventServiceService {
  constructor(private apiService: ApiService) {}

  async getEvent(offset: number, limit: number) {
    const query = {
      offset: offset, // Offset for pagination
      limit: limit, // Limit for number of records
    };

    return this.apiService.commonGet("/events", query);
  }

  async postEvent(data: any) {
    return await this.apiService.commonPost("/events", data);
  }

  async updateEvent(id: any, data: any) {
    return await this.apiService.commonPatch("/events/" + id, data);
  }

  deleteEvent(id: number) {
    return this.apiService.commonDelete("/events/" + id);
  }

  getEventbyId(id: any) {
    return this.apiService.commonGet("/events/" + id);
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage("/events/image/" + id, file);
  }

  async eventsImages(id, index) {
    return await this.apiService.commonDelete(
      "/events/gallery/" + id + "/" + index
    );
  }

  async getEventFilterForYearMonth(offset: number, limit: number, search: any) {
    let query: any = {
      offset: offset,
      limit: limit,
      where: search,
    };

    return this.apiService.commonGet("/events", query);
  }

  // async getGeneralFeed(offset: number, limit: number) {
  //   const query = {
  //     offset: offset, // Offset for pagination
  //     limit: limit, // Limit for number of records
  //   };
  //   return this.apiService.commonGet("/generate-feed", query);
  // }

  // async getGeneralFeedByCategory(category: string, offset: number, limit: number) {
  //   const query = {

  //       where: {
  //         category: category // Filter based on category
  //       },
  //       offset: offset,
  //       limit: limit

  //   };

  //   return this.apiService.commonGet("/generate-feed", query);
  // }

  // async getGeneralFeed(offset: number, limit: number, type?: string) {
  //   const query: any = { offset, limit };
  //   if (type && type !== 'all') {
  //     query.type = type; // Pass selected type
  //   }
  //   return this.apiService.commonGet("/generate-feed", query);
  // }
  getGeneralFeed(type: string = 'all', offset: number, limit: number) {
    const params: any = { offset, limit };
    return this.apiService.commonGet('/generate-feed/' + type, params);
  }



}
