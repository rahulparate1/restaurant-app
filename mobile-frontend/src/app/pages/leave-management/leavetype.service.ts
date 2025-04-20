import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {

  constructor(private apiService: ApiService,
    private http: HttpClient) { }


  async getLeaveType() {
    return await this.apiService.commonGet('/leavetypes');
  }

  async postLeaveType(data: any) {
    return await this.apiService.commonPost('/leavetypes', data);
  }

  async updateLeaveType(id: any, data: any) {
    return await this.apiService.commonPatch('/leavetypes/' + id, data);
  }

  deleteLeaveType(id: number) {
    return this.apiService.commonDelete('/leavetypes/' + id);
  }



  getLeaveTypebyId(id: any) {
    return this.apiService.commonGet('/leavetypes/' + id);
  }



}
