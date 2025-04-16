import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NonVegCategoryService {

   constructor(private http: HttpClient) {}

   getAllCategories(url: string) {
     return this.http.get(url);
   }

   getCategoryById(url: string) {
     return this.http.get(url);
   }

   createCategory(url: string, data: any) {
     return this.http.post(url, data);
   }

   updateCategory(url: string, data: any) {
     return this.http.patch(url, data);
   }

   deleteCategory(url: string) {
     return this.http.delete(url);
   }
}
