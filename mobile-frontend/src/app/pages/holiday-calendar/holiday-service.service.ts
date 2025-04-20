import { Injectable } from '@angular/core';
import { ApiService } from '../../../app/core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayServiceService {
  jobList$: any;

  constructor(private apiService: ApiService) { }
  async getHoliday(){
    return await this.apiService.commonGet(
      "/holiday"
    );
  }

  async getHolidayById(id: any){
    return await this.apiService.commonGet(
      "/holiday/" +id
    );
  }


  async postHoliday(data: any) {
    return await this.apiService.commonPost("/holiday", data);
  }

  async updateHoliday(id:any,data:any){
    return await this.apiService.commonPatch(
      "/holiday/"+id,data
);
  }

  deleteHoliday(id :number){
    return  this.apiService.commonDelete(
      "/holiday/" +id

    );
  }

  async postImage(file : any, id) {
    return await this.apiService.commonPostImage("/holiday/image/" + id, file);
  }
}
