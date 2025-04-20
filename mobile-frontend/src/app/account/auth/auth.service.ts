import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; // Import for error handling

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    public apiService: ApiService,
    public toastController: ToastController
  ) {}

  async postLogin(data: any) {
    return await this.apiService.commonPost('/users/login', data);
  }

  async getLogin() {
    return await this.apiService.commonGet('/users/login');
  }

  updatePassword(email: string, password: any) {
    return this.apiService.commonPost('/user/update-password/' + email, password);
  }

  async getUserList(searchCriteria: any) {
    let query = { where: searchCriteria };
    return await this.apiService.commonGet('users', query);
  }

  async generateOtpForCompany(data: any) {
    return await this.apiService.commonPost('/companies/generate-otp/', data);
  }

  verifyOtpForCompany(email: string, otp: string) {
    return this.apiService.commonPost('/companies/verify-otp/' + email, otp);
  }

  verifyUser(email: string) {
    return this.apiService.commonGet('/verify-employees/' + email);
  }

  async postSignUp(data: any) {
    return await this.apiService.commonPost('/companies/onboard', data);
  }

  verifyNumber(mobileNo: string) {
    return this.apiService.commonGet('/verify-employee-by-mobile/' + mobileNo);
  }

  verifyCompanyName(companyName: string) {
    return this.apiService.commonGet('/verify-company-name/' + companyName);
  }

  verifyUserMobileNo(mobileNo: string) {
    return this.apiService.commonGet('/verify-mobileNo/' + mobileNo);
  }

  verifyPassword(loginData: any) {
    return this.apiService.commonPost('/user/verify-login', loginData);
  }

  // Google Sign-In 
  googleSignIn(): Observable<any> {
    return this.http.post('/api/auth/google', {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Microsoft Sign-In 
  microsoftSignIn(): Observable<any> {
    return this.http.post('/api/auth/microsoft', {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private async handleError(error: any): Promise<Observable<never>> {
    const toast = await this.toastController.create({
      message: 'An error occurred. Please try again.',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
    return throwError(error);
  }
}

