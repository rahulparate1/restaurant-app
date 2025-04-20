import { Injectable } from '@angular/core';

import { getFirebaseBackend } from '../../authUtils';
import { User } from 'src/app/store/Authentication/auth.models';
import { from, map } from 'rxjs';


@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  payoUser!: User; ;
  tokenKey = 'token';
  userKey = 'payoutUser';
  companyId = 'companyId'

    constructor() {
    }

    /**
     * Returns the current user
     */
    // public currentUser(): User {
    //   let localUser = localStorage.getItem(this.userKey);
    //   if (localUser) {
    //     let profile = JSON.parse(localUser);
    //     if (profile) {
    //       return {    token: localStorage.getItem(this.tokenKey) || '', username: profile.name, id: profile.id, password: '', email: '' };
    //     }
    //   }
    //   return null;
    // }

    public currentUser(): User | null {
      const localUser = localStorage.getItem(this.userKey);
      if (localUser) {
        const profile = JSON.parse(localUser);
        if (profile) {
          return {
            token: localStorage.getItem(this.tokenKey) || '',
            username: profile.name,
            id: profile.id,
            password: '',
            email: '',
          };
        }
      }
      return null;
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
        return from(getFirebaseBackend().loginUser(email, password).pipe(map(user => {
            return user;
        }
        )));
    }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(user: User) {
        // return from(getFirebaseBackend().registerUser(user));

        return from(getFirebaseBackend().registerUser(user).then((response: any) => {
            const user = response;
            return user;
        }));
    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend().forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }

    /**
     * Logout the user
     */
    logout() {
        localStorage.clear();
    }
}

