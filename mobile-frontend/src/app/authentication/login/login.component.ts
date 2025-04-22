import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AuthenticationService1 } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {



  submit: boolean;
  isLoading: boolean = false; // Add loading state
  formsubmit: boolean;
  invalidCreds: boolean = false;
  id: any;
  exitDocuments: any;
  exitProcessDetails: any;
  employeeDetails: any;
  loginform: FormGroup;
  showPassword = false;

  constructor(
    private router: Router,
    private authservice: AuthenticationService,
    private authenticationService: AuthenticationService1,
    // private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
  ) {
  }
  ngOnInit(): void {

    this.loginform = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberDevice: [false],
    });
  }


  get f() {
    return this.loginform.controls;
  }

  // Submits the login form, validates credentials, and navigates based on the response - (Vaishnavi)
  async onSubmit() {
    if (!this.loginform.valid) {
      console.error('Form is invalid.');
      return;
    }

    this.isLoading = true; // Start loader
    const credentials = {
      username: this.loginform.value.username,
      password: this.loginform.value.password,
    };

    this.loginform.valueChanges.subscribe(() => {
      this.invalidCreds = false;
    });

    const encryptedCredentials = this.encryptCredentials(credentials);

    (await this.authenticationService.postLogin({ input: encryptedCredentials })).subscribe(
      (res: any) => {
        this.isLoading = false; // Stop loader

        if (res.token && res.token.length) {
          this.invalidCreds = false;
          this.authservice.setUser(res);

          // ✅ Reset the form only on success
          this.loginform.reset();
          this.submit = false; // Reset submit state

          const profileEmployee = res.profile?.employee;
          if (profileEmployee) {
            if (profileEmployee.exitStatus === true) {
              this.router.navigate(['exit/profile']);
            } else {
              this.router.navigate(['dashboard/']);
            }
          } else {
            console.error('Profile employee not found in response.');
            this.router.navigate(['dashboard/']);
          }
        } else {
          this.invalidCreds = true;
        }
      },
      (error) => {
        this.isLoading = false; // Stop loader on error

        // ✅ Ensure the form remains filled
        this.invalidCreds = true;
        this.submit = true;
        this.formsubmit = true;

        console.error('Login failed:', error);
      }
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // async onSubmit() {
  //   if (!this.loginform.valid) {
  //     console.error('Form is invalid.');
  //     return;
  //   }
  //   this.isLoading = true; // Start loader
  //   const credentials = {
  //     username: this.loginform.value.username,
  //     password: this.loginform.value.password,
  //   };
  //   this.loginform.valueChanges.subscribe(() => {
  //     this.invalidCreds = false;
  //   });
  //   const encryptedCredentials = this.encryptCredentials(credentials);

  //   (
  //     await this.authService.postLogin({ input: encryptedCredentials })
  //   ).subscribe(
  //     (res: any) => {
  //       this.isLoading = false; // Stop loader
  //       if (res.token && res.token.length) {

  //         this.invalidCreds = false;
  //         this.authenticationService.setUser(res);
  //         // this.loginform.reset();
  //         const profileEmployee = res.profile?.employee;
  //         if (profileEmployee) {
  //           if (profileEmployee.exitStatus === true) {
  //             this.router.navigate([
  //                'exit/profile',
  //               // 'exit/documents/' + profileEmployee.exitProcessId,
  //             ]);
  //           } else {
  //             this.router.navigate(['/']);
  //           }
  //         } else {
  //           console.error('Profile employee not found in response.');
  //           this.router.navigate(['/']);
  //         }
  //       } else {
  //         this.submit = true;
  //         this.formsubmit = true;
  //         this.invalidCreds = true;
  //       }
  //     },
  //     (error) => {
  //       this.isLoading = false; // Stop loader on error
  //       this.invalidCreds = true;
  //       return;
  //     }
  //   );
  // }
// Encrypts user credentials before sending them to the server - (Vaishnavi)
  encryptCredentials(credentials: any): string {
    try {
      const credentialsString = JSON.stringify(credentials);
      const key = 'Xaa3Mivmz5Tllvq';
      return CryptoJS.AES.encrypt(credentialsString, key).toString();
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }
// Navigates to the forgot password page - (Vaishnavi)
  forgetPassword() {
    this.router.navigate(['/auth/reset-password']);
  }

}
