import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService1 {

  constructor(
    private http: HttpClient,
    public apiService: ApiService,
  ) {}

  // async postSignUp(data: any) {
  //   return await this.apiService.commonPost('/companies/onboard', data);
  // }/restaurants/generate-otp

  registerRestaurant(data: any) {
    return this.http.post('/restaurant-signup', data);
  }
  verifyOtpForCompany(email: string, otp: string) {
    return this.apiService.commonPost('/restaurants/verify-otp/' + email, otp);
  }

  async generateOtpForCompany(data: any) {
    return await this.apiService.commonPost('/restaurants/generate-otp/', data);
  }




  verifyUser(email: string) {
    return this.apiService.commonGet('/verify-employees/' + email);
  }

  async postSignUp(data: any) {
    return await this.apiService.commonPost('/restaurants/onboard', data);
  }

  async postLogin(data: any) {
    return await this.apiService.commonPost('/users/login', data);
  }
}
