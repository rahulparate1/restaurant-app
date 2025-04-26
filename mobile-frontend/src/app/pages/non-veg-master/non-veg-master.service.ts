import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NonVegMasterService {

  constructor(private http: HttpClient) {}

    // Get all items
    async getAllItems(url: string): Promise<Observable<any>> {
      return this.http.get(url);
    }

    // Get item by ID
    async getItemById(url: string): Promise<Observable<any>> {
      return this.http.get(url);
    }

    // Create new item
    async createItem(url: string, data: any): Promise<Observable<any>> {
      return this.http.post(url, data);
    }

    // Update existing item
    async updateItem(url: string, data: any): Promise<Observable<any>> {
      return this.http.patch(url, data);
    }

    // Delete item
    async deleteItem(url: string): Promise<Observable<any>> {
      return this.http.delete(url);
    }
}
