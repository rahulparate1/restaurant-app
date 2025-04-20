import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralConfigurationService {

  constructor(private apiService: ApiService) {}

  //Department API

  async getDepartment() {
    return await this.apiService.commonGet('/departments');
  }
  async postDepartment(data: any) {
    return await this.apiService.commonPost('/departments', data);
  }

  async updateDepartment(id: any, data: any) {
    return await this.apiService.commonPatch('/departments/' + id, data);
  }

  deleteDepartment(id: number) {
    return this.apiService.commonDelete('/departments/' + id);
  }

  getDepartmentbyId(id: any) {
    return this.apiService.commonGet('/departments/' + id);
  }

  //Designation API

  async getDesignation() {
    return await this.apiService.commonGet('/designations');
  }

  async postDesignation(data: any) {
    return await this.apiService.commonPost('/designations', data);
  }

  async updateDesignation(id: any, data: any) {
    return await this.apiService.commonPatch('/designations/' + id, data);
  }

  deleteDesignation(id: number) {
    return this.apiService.commonDelete('/designations/' + id);
  }

  getDesignationbyId(id: any) {
    return this.apiService.commonGet('/designations/' + id);
  }

  //Work Location API

  async getWorkLocation() {
    return await this.apiService.commonGet('/worklocations');
  }

  async postWorkLocation(data: any) {
    return await this.apiService.commonPost('/worklocations', data);
  }

  async updateWorkLocation(id: any, data: any) {
    return await this.apiService.commonPatch('/worklocations/' + id, data);
  }

  deleteWorkLocation(id: number) {
    return this.apiService.commonDelete('/worklocations/' + id);
  }

  getWorkLocationbyId(id: any) {
    return this.apiService.commonGet('/worklocations/' + id);
  }

  //Work Industry API

  async getIndustry() {
    return await this.apiService.commonGet('/industries');
  }

  async postIndustry(data: any) {
    return await this.apiService.commonPost('/industries', data);
  }

  async updateIndustry(id: any, data: any) {
    return await this.apiService.commonPatch('/industries/' + id, data);
  }

  deleteIndustry(id: number) {
    return this.apiService.commonDelete('/industries/' + id);
  }

  getIndustrybyId(id: any) {
    return this.apiService.commonGet('/industries/' + id);
  }

  //Leave Type API

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
