import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyConfigurationService {

  constructor(private apiService: ApiService) {}

  async postOrganisation(data: any, id = '') {

      return await this.apiService.commonPatch('/companies' + id, data);

  }

  async postEntity(data: any, id: string, entity: string) {
    return await this.apiService.commonPost(
      '/companies/' + id + '/' + entity,
      data
    );
  }

  async getCompanyDetails(id: string) {
    return await this.apiService.commonGet('/companies/' + id);
  }


  getCompanybyId(id: any) {
    return this.apiService.commonGet("/companies/" + id);
  }

  async postImage(file: any, id) {
    return await this.apiService.commonPostImage(
      '/companies/image/' + id,
      file
    );
  }

  async postBrandingImage(file: any, id) {
    return await this.apiService.commonPostImage(
      '/branding/image/' + id,
      file
    );
  }

  async postBrandingImageLogo(file: any, id) {
    return await this.apiService.commonPostImage(
      '/monogramLogo/image/' + id,
      file
    );
  }

  async postBranding(data: any) {
    return await this.apiService.commonPost('/branding', data);
  }

  async updateBranding(id: any, data: any) {
    return await this.apiService.commonPatch('/branding/' + id, data);
  }

  getBrandingbyId(id: any) {
    return this.apiService.commonGet('/departments/' + id);
  }
}
