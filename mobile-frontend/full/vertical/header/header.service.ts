import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(
    private apiService: ApiService
  ) { }

  async getNotification() {
    return await this.apiService.commonGet("/notifications");
  }
  
  deleteNotification(id :number){
    return this.apiService.commonDelete("/notifications/"+id);
  } 
}
