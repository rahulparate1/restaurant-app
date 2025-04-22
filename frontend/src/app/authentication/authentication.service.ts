import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private http: HttpClient,
    public apiService: ApiService,
  ) {}

  async postSignUp(data: any) {
    return await this.apiService.commonPost('/companies/onboard', data);
  }

  registerRestaurant(data: any) {
    return this.http.post('/restaurant-signup', data);
  }
}
