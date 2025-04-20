import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SupportTypeService {

  constructor(private apiService: ApiService) { }
  async postSupport(data : any){
    return await this.apiService.commonPost(
      "/support-types" ,data
    );
  }
  async updateSupport(id:any ,data : any){
    return await this.apiService.commonPatch(
      "/support-types/" +id ,data
    );
  }

  getSupportById(id: any){
    return this.apiService.commonGet("/support-types/" + id)
  }

  async getSupport(){
    return await this.apiService.commonGet(
      "/support-types"
    );
  }

  deleteSupport(id :number){
    return  this.apiService.commonDelete(
      "/support-types/" +id
    );
  }

  async postImage(file : any, id) {
    return await this.apiService.commonPostImage("/support-types/image/" + id, file);
  }
  getSupportListAll(){
    return this.apiService.commonGet("/employee-all");
  }
}


