import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveCalendarService {

  constructor(private apiService: ApiService) {}
 


  // getLeavebyId(id: any) {
  //   return this.apiService.commonGet('/leave/' + id);
  // }

  getLeavebyId(id: any) {
    let include = { include: [{ relation: 'user' }] };
    return this.apiService.commonGet('/leave/' + id, include);
  }

  
  async getLeaveData() {
    return await this.apiService.commonGet('/leave');
  }

  async getLeaveTypes() {
    return await this.apiService.commonGet('/leavetypes');
  }

  async getLeaveDataAttendance(year: any, month: any) {
    return this.apiService.commonGet("/leave/" + year + "/" + month);
  }

  async getLeaveData1(year: any, month: any) {
    let include = { include: [{ relation: 'employee' }] };
    return this.apiService.commonGet("/leave/" + year + "/" + month, include);
  }

  async postHoliday(data: any) {
    return await this.apiService.commonPost("/holiday", data);
  }


  async getHolidayData() {
    return await this.apiService.commonGet('/holiday');
  }

 
  async getHoliday(year: any, month: any ) {
    return this.apiService.commonGet("/holiday/" + year + "/" + month );
  }


  async getLeave(offset: number, limit: number, search: any) {
    let include = [{ relation: 'user' }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet('/leave', query);
  }

  // async getHoliday(offset: number, limit: number, search: any) {
  //   let include = [{ relation: 'user' }];
  //   let query = {
  //     offset: offset,
  //     limit: limit,
  //     where: search,
  //     include: include,
  //   };
  //   return await this.apiService.commonGet('/holiday', query);
  // }

  // getPayoutById(id: any) {
  //   let include = { include: [{ relation: 'Employee' }] };
  //   return this.apiService.commonGet('payouts/' + id, include);
  // }

}


