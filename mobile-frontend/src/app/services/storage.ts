import { Injectable } from "@angular/core";
import { Storage } from "@capacitor/storage";
import { environment } from "../environments/environment";
import { Platform } from "@ionic/angular"; // Import the correct Platform from Ionic

@Injectable({
  providedIn: "root",
})

export class StorageService {
  constructor(public platform: Platform) {}
  base_path = environment.apiEndpoint;
  store_base_url = environment.frontAPPEndpoint;


  async setString(key: string, value: string) {
    if (this.isMobile()) {
      await Storage.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async getString(key: string): Promise<{ value: any }> {
    if (this.isMobile()) {
      return await Storage.get({ key });
    } else {
      return { value: localStorage.getItem(key) };
    }
  }


  getStorage(_key: string): any {
    return localStorage.getItem(_key);
  }

  async setStorage(_key: string, _value: any) {
      if (!_value || _value === "") {
        localStorage.removeItem(_key);
      } else {
        localStorage.setItem(_key, _value);
      }
  }


  async setObject(key: string, value: any) {
    const valueStr = JSON.stringify(value);
    this.setStorage(key, valueStr);
  }

  async getObject(key: string): Promise<{ value: any }> {
    const result = await this.getStorage(key);
    return { value: JSON.parse(result.value) };
  }

  async removeItem(key: string) {
    if (this.isMobile()) {
      await Storage.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clearStorage() {
    if (this.isMobile()) {
      await Storage.clear();
    } else {
      localStorage.clear();
    }
  }

  private isMobile(): boolean {
    return this.platform.is("mobile");
  }

}
