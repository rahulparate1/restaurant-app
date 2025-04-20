import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Router } from "@angular/router";
@Injectable({
  providedIn: 'root'
})
export class ExitProcessService {
  constructor(private apiService: ApiService,
    public router: Router
  ) { }
  async postExitProcess(data: any) {
    return await this.apiService.commonPost(
      "/exit-process", data
    );
  }

  async updateExitProcess(id: any, data: any) {
    return await this.apiService.commonPatch(
      "/exit-process/" + id, data
    );
  }

  async updateEmployee(id: any, data: any) {
    return await this.apiService.commonPatch(
      "/employees/" + id, data
    );
  }


  getExitProcessById(id: any) {
    return this.apiService.commonGet("/exit-process/" + id)
  }

  async getExitProcess() {
    return await this.apiService.commonGet(
      "/exit-process"
    );
  }


  deleteExitProcess(id: number) {
    return this.apiService.commonDelete(
      "/exit-process/" + id
    );

  }

  async addDocument(file, id, callback) {
    return (await this.apiService.addImage(file, "/exit-process/document/" + id, callback));
  }

  async uploadFileWithDocumentName(formData: FormData, id: string, callback: Function) {
    try {
      // Use the API service to send the file along with the necessary parameters
      return await this.apiService.addImage(formData, "/exit-process/document/" + id, callback);
    } catch (error) {
      // Handle any errors here
      console.error("Error uploading document:", error);
      throw error; // Re-throw the error if needed
    }
  }


  async removeDocument(id, index) {
    return (await this.apiService.commonDelete('/exit-process/document/' + id + '/' + index));
  }


  async postImage(file: any, id) {
    return await this.apiService.commonPostImage("/exit-process/image/" + id, file);
  }

  async removeGalleryImages(id, index) {
    return (await this.apiService.commonDelete('/exit-process/gallery/' + id + '/' + index));
  }

  async commonPostImageGallery(file) {
    return Observable.create(observer => {
      let token = this.apiService.getStorage("token");
      var data = new FormData();
      data.append("file", file, file.name);
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      });

      xhr.open("POST", this.apiService.base_path + "/exit-process/gallery");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.send(data);
    });
  }

  // getExitProcessForInclude(){
  //   let include = {"include":[{"relation":"user"}]}
  //   return this.apiService.commonGet("/exit-process/", include);
  // }
  async getExitProcessFilter(offset: number, limit: number, search: any) {
    let include = [{ relation: 'user' }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet('/exit-process/', query);
  }

  async getResignationFilter(offset: number, limit: number, search: any) {
    let include = [{ relation: 'user' }];
    let query = {
      offset: offset,
      limit: limit,
      where: search,
      include: include,
    };
    return await this.apiService.commonGet('/resignation/', query);
  }

  async getResignationForEmployee(offset: number, limit: number, search: any) {
    let query = {
      offset: offset,
      limit: limit,
      where: search
    };
    return await this.apiService.commonGet("/reimbursements", query);
  }

  canActivate(): boolean {
    const user = JSON.parse(localStorage.getItem("payoutUser"));
    if (user?.employee?.exitStatus === true) {
      this.router.navigate(['/exit/profile']);
      return false; 
    }
    return true;
  }

  logout() {
    // logout the user
    // getFirebaseBackend().logout();
    localStorage.clear();
  }
}  