import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Injectable({
  providedIn: "root",
})
export class LeaveManagementServiceService {
  constructor(private apiService: ApiService) {}
  async postLeave(data: any) {
    return await this.apiService.commonPost("/leave", data);
  }

  async updateLeave(id: any, data: any) {
    return await this.apiService.commonPatch("/leave/" + id, data);
  }

  deleteLeave(id: number) {
    return this.apiService.commonDelete("/leave/" + id);
  }
  async myLeave(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet("/my-leave", query);
  }

  getLeavebyId(id: any) {
    let include = { include: [{ relation: "user" }] };
    return this.apiService.commonGet("/leave/" + id, include);
  }

  async getLeaveData() {
    return await this.apiService.commonGet("/leave");
  }

  async getEmpLeaves(userId: string) {
    try {
      let include = [{ relation: "user" }];
      let query = {
        where: { userId: userId },
        include: include,
      };
      const response = await this.apiService.commonGet("/leave", query);
      console.log("Leave data response:", response); // Log the API response
      return response;
    } catch (error) {
      console.error("Error fetching leave data:", error);
      throw error;
    }
  }

  async getLeave(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet("/leave", query);
  }
  async postImage(file: any, id) {
    return await this.apiService.commonPostImage("/leave/image/" + id, file);
  }

  async postNotification(data: any) {
    return await this.apiService.commonPost("/notifications", data);
  }

  async getEmployee() {
    return await this.apiService.commonGet("/employees");
  }

  async getEmployeeById(id) {
    return await this.apiService.commonGet("/employees/" + id);
  }

  getFilteredLeaveData(searchTerm: string) {
    return this.apiService.commonGet(`
      "/employees"
      `);
  }

  async getEmployeeListForFilter() {
    let include = { include: [{ relation: "leave" }] };
    return await this.apiService.commonGet("/employees-names", include);
  }

  async getEmployeeFilter(offset: number, limit: number, search: any) {
    let query = {
      offset: offset,
      limit: limit,
      where: search,
    };
    return await this.apiService.commonGet(
      "/employees/employees-specific",
      query
    );
  }

  async getEmployeeListAll() {
    return await this.apiService.commonGet("/employee-all");
  }

  async getLoggedInEmployee() {
    return await this.apiService.commonGet("/my-leave-details-loggedin"); // Update the endpoint as necessary
  }

  async postLeaveType(data: any) {
    return await this.apiService.commonPost("/leavetypes", data);
  }
  async getLeaveType() {
    return await this.apiService.commonGet("/leavetypes");
  }

  async updateEmployee(id: any, data: any) {
    return await this.apiService.commonPatch("/employees/" + id, data);
  }

  upsertLeaveBalance(leaveBalanceData: any) {
    return this.apiService.commonPost(
      "/leave-balance/upsert",
      leaveBalanceData
    );
  }

  async getEmployeeList() {
    return await this.apiService.commonGet("/employees");
  }

  async getEmployeeListForManager(offset: number, limit: number, search: any) {
    let include = [{ relation: "user" }];
    let query = {
      include: include,
      offset: offset,
      limit: limit,
      where: search,
    };
    return await this.apiService.commonGet("/manager-leaves", query);
  }

  async getTeammatesOnLeave(
    startDate: string,
    endDate: string,
    department: string
  ) {
    return await this.apiService.commonGet(
      "/teammates-on-leave/" + startDate + "/" + endDate + "/" + department
    );
  }

  async getEmployeeLeaveBalance(employeeId: string) {
    return await this.apiService.commonGet("/leaveBalance/" + employeeId);
  }
}
