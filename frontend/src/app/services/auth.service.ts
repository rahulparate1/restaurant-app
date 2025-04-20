import { Injectable } from '@angular/core';

//import { getFirebaseBackend } from '../../authUtils';

import { User } from '../../app/core/models/auth.models';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

  payoUser: User;
  tokenKey = 'token';
  userKey = 'payoutUser';
  companyId = 'companyId'

  constructor() {
  }

  /**
   * Returns the current user
   */
  public currentUser(): User {
    let localUser = localStorage.getItem(this.userKey);
    if (localUser) {
      let profile = JSON.parse(localUser);
      if (profile) {
        return { token: localStorage.getItem(this.tokenKey), username: profile.name, id: profile.id, password: '', email: '' };
      }
    }
    return null
  }

  public setUser(response: { token: string, profile: any, companyId: any }) {
    localStorage.setItem(this.tokenKey, response.token)
    localStorage.setItem(this.companyId, response.profile?.company?.id)
    // localStorage.setItem(this.companyId, response.profile.email)
    localStorage.setItem(this.userKey, JSON.stringify(response.profile))

  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  login(email: string, password: string) {
    // return getFirebaseBackend().loginUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });
  }

  /**
   * Performs the register
   * @param email email
   * @param password password
   */
  register(email: string, password: string) {
    // return getFirebaseBackend().registerUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });
  }

  /**
   * Reset password
   * @param email email
   */
  resetPassword(email: string) {
    // return getFirebaseBackend().forgetPassword(email).then((response: any) => {
    //     const message = response.data;
    //     return message;
    // });
  }

  /**
   * Logout the user
   */
  logout() {
    // logout the user
    // getFirebaseBackend().logout();
    localStorage.clear();
  }
}

