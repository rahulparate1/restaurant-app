import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SupportServiceService {
  support(id: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private apiService: ApiService) { }
  async postSupport(data : any){
    return await this.apiService.commonPost(
      "/supports" ,data
    );
  }
  async updateSupport(id:any ,data : any){
    return await this.apiService.commonPatch(
      "/supports/" +id ,data
    );
  }

  getSupportById(id: any){
    return this.apiService.commonGet("/supports/" + id)
  }

  async getSupport(){
    return await this.apiService.commonGet(
      "/supports"
    );
  }

  deleteSupport(id :number){
    return  this.apiService.commonDelete(
      "/supports/" +id
    );
  }

  async postImage(file : any, id) {
    return await this.apiService.commonPostImage("/supports/image/" + id, file);
  }

  async getSupportForInclude(offset: number, limit: number, search: any) {
    let include = [{ relation: 'user' }, { relation: 'Company' }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      //include: include,
    };
    return await this.apiService.commonGet("/supports", query);
  }
  getSupportListAll(){
    return this.apiService.commonGet("/employee-all");
  }
}
