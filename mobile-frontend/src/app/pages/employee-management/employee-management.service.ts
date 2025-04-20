import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Injectable({
  providedIn: "root",
})
export class EmployeeManagementService {
  constructor(private apiService: ApiService) {}

  async postOverview(data: any, id = "") {
    if (id?.length > 0 && id != "0") {
      return await this.apiService.commonPatch("/employees/" + id, data);
    } else {
      return await this.apiService.commonPost("/employees", data);
    }
  }

  async dataPatch(id: any, data: any) {
    return await this.apiService.commonPatch("/employees/" + id, {
      basicDetails: data,
    });
  }

  async additionalData(id: any, data: any) {
    return await this.apiService.commonPatch("/employees/" + id, data);
  }

  async updateEmployeeTemp(id: any, data: any) {
    return await this.apiService.commonPatch("/employee-temp/" + id, {
      status: data,
    });
  }

  async postOverview1(data: any) {
    return await this.apiService.commonPost("/employee-temp", data);
  }

  async postEntities(data: any, id: string, entity: string) {
    return await this.apiService.commonPost(
      "/employees/" + id + "/" + entity,
      data
    );
  }

  getTempData(offset: number, limit: number, search: any) {
    let query = {
      offset: offset,
      limit: limit,
      where: search,
    };
    return this.apiService.commonGet("/employee-temp", query);
  }

  async getEmployeeDetails(id: string) {
    return await this.apiService.commonGet("/employees/" + id);
  }

  async getTempById(id: any) {
    return await this.apiService.commonGet("/employee-temp/" + id);
  }

  async getEmployeeFilter(offset: number, limit: number, search: any) {
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      // include: [
      //   { "relation": "Shift" }
      // ],

    };
    return await this.apiService.commonGet("/employees/employees-specific", query);
  }

  async deleteEmployee(id: number) {
    return await this.apiService.commonDelete("/employees/" + id);
  }

  getEmployeebyId(id: any) {
    return this.apiService.commonGet("/employees/" + id);
  }

  getEmployeeView(id: any) {
    return this.apiService.commonGet("/employees/employees-specific/" + id);
  }

  getEmployeeView1() {
    return this.apiService.commonGet("/employees/my-profile");
  }

  getEmployeeList() {
    return this.apiService.commonGet("/employees/employees-specific");
  }

  getLeaveType() {
    return this.apiService.commonGet("/leavetypes");
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage(
      "employees/image/" + id,
      file
    );
  }

  getEmployeeDepartmentCount() {
    return this.apiService.commonGet("/employees/countByDepartment");
  }

  async getEmployeeCount() {
    return await this.apiService.commonGet("/employee/employeeTypeCounts/");
  }

  async getWorkLocationCount() {
    return await this.apiService.commonGet("/employees/countByWorkLocation");
  }

  async getMonthYearCount() {
    return await this.apiService.commonGet("/employees/countByJoinMonth");
  }

  async getExitListCount() {
    return await this.apiService.commonGet("/employees/statusList");
  }

  async updateEmployee(id: any, data: any) {
    return await this.apiService.commonPatch("/employees/" + id, data);
  }

  async postLeaveBalance(payload: any) {
    return await this.apiService.commonPost("/leavebalance", payload);
  }



  async getEmployeeByUserId(id) {
    return await this.apiService.commonGet('/verify-employeesUserId/' + id);}

  verifyEmployeeCode(employeeCode: any) {
    return this.apiService.commonGet('/verify-employeeCode/' + employeeCode);
  }

  suspendEmployee(id: number) {
    return this.apiService.commonPut(`/employees/${id}/suspend`, {}); // Pass an empty object as data
  }

  activeEmployee(id: number) {
    return this.apiService.commonPut(`/employees/${id}/activate`, {}); // Pass an empty object as data
  }


  async getStatusCount() {
    return await this.apiService.commonGet("/employees/statusCount");
  }

  async generateOtp(data: any) {
    return await this.apiService.commonPost("/user/generate-otp/", data);
  }
  verifyUser(email: any) {
    return this.apiService.commonGet("/verify-employee/" + email)
  }

  verifyOtp(id: string, otp: string)
  {
    return this.apiService.commonPost("/user/verify-otp/"+ id, otp);
  }

  updatePassword(email: string, password: any)
  {
    return this.apiService.commonPost("/user/update-password1/"+ email, password);
  }



  verifyPassword(loginData)
  {
    return this.apiService.commonPost("/user/verify-login", loginData);
  }

  getAdminUsers() {
    return this.apiService.commonGet("/admin-users");
  }
}
