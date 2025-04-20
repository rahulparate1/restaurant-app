import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private apiService: ApiService,) { }

  async postAttendance(data) {
    return await this.apiService.commonPost(
      "/attendance/", data
    );
  }
  getAttendance1(month?: string, year?: string) {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    return this.apiService.commonGet('/attendance', params);
  }

  async getAttendance(year: any, month: any,offset: number, limit: number, search: any) {
    let include = [
      { relation: 'user' },
    ];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return this.apiService.commonGet("/attendance/" + year + "/" + month , query);
  }

  async getAttendanceAdmin(year: any, month: any) {
    return this.apiService.commonGet("/attendance/" + year + "/" + month );
  }

  async getAttendanceAll() {
    return await this.apiService.commonGet('attendance/');
  }

  async checkIn(data: any) {
    return this.apiService.commonPost('/attendance/log', data);
  }
  async checkOut(data: any) {
    return this.apiService.commonPost('/attendance/log', data);
  }
  async updateAttendance(id: string, updatedData: any) {
    return this.apiService.commonPatch(`/attendance/update/${id}`, updatedData);
  }

  async getAttendanceEmp(year: any, month: any, userId: string,) {
    return this.apiService.commonGet("/attendance/" + year + "/" + month + "/" + userId);
  }

  async getAttendanceEmpDayWise(year: any, month: any, day: any, userId: string,) {
    return this.apiService.commonGet("/attendance/" + year + "/" + month + "/" + day + "/" + userId);
  }

  async getHoliday(){
    return await this.apiService.commonGet(
      "/holiday"
    );
  }


  async attendanceRequest(data: any) {
    return this.apiService.commonPost('/attendance-requests', data);
  }

  // async getRequestAttendanceAll() {
  //   return await this.apiService.commonGet('/attendance-requests');
  // }

  async getAttendanceRequestAll(offset: number, limit: number,) {
    let include = [{ relation: 'user' }];
    let query = {
      offset: offset,
      limit: limit,
      include: include,
    };
    return await this.apiService.commonGet('/attendance-requests', query);
  }

  // async updateRequest(item: any, data: any) {
  //   return await this.apiService.commonPatch(
  //     "/attendance-requests/" + item?.id, item
  //   );
  // }
  async updateRequest(item: any, data: any) {
    return await this.apiService.commonPatch(
      "/attendance-requests/" + item?.id, item  // Pass 'data' instead of 'item'
    );
  }
  async deleteRequest(id: any) {
    return await this.apiService.commonDelete("/attendance-requests/" + id);
  }

  async getTimesheetByAttendanceId(attendanceId: string) {
    return this.apiService.commonGet(`/timesheets/by-attendance/${attendanceId}`);
  }

  async updateTimesheet(id: any, data: any) {
    return await this.apiService.commonPatch("/timesheets/" + id, data);
  }

  async postTimesheet(data: any) {
    return await this.apiService.commonPost("/timesheets", data);
  }

  async getTimesheetbyId(id: any) {
    return await this.apiService.commonGet("/timesheets/" + id);
  }



  // async getAllTimesheets() {
  //   return await this.apiService.commonGet("/timesheets");
  // }

  async getAllTimesheets(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet("/timesheets", query);
  }

  async getEmployeeListForFilter() {
    return await this.apiService.commonGet("/employees-names");
  }

  async updateTaskType(id: any, data: any) {
    return await this.apiService.commonPatch("/timesheet-tasks/" + id, data);
  }

  async postTaskType(data) {
    return await this.apiService.commonPost(
      "/timesheet-tasks/", data
    );
  }

  async getAllTimesheetTaskTypes() {
    return await this.apiService.commonGet("/timesheet-tasks");
  }

  async postNotification(data: any) {
    return await this.apiService.commonPost("/notifications", data);
  }

  async myTimesheet(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet("/my-timesheet", query);
  }
}
