import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
// import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  styleUrls: ['./login2.component.scss']
})

export class Login2Component implements OnInit {
  submit: boolean;
  isLoading: boolean = false; // Add loading state
  formsubmit: boolean;
  invalidCreds: boolean = false;
  id: any;
  exitDocuments: any;
  exitProcessDetails: any;
  employeeDetails: any;
  loginform: FormGroup;

  constructor(
    private router: Router,
    private service: AuthService,
    private authenticationService: AuthenticationService,
    private authService: AuthService,
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

    // const encryptedCredentials = this.encryptCredentials(credentials);

    // (await this.authService.postLogin({ input: encryptedCredentials })).subscribe(
    //   (res: any) => {
    //     this.isLoading = false; // Stop loader

    //     if (res.token && res.token.length) {
    //       this.invalidCreds = false;
    //       this.authenticationService.setUser(res);

    //       // ✅ Reset the form only on success
    //       this.loginform.reset();
    //       this.submit = false; // Reset submit state

    //       const profileEmployee = res.profile?.employee;
    //       if (profileEmployee) {
    //         if (profileEmployee.exitStatus === true) {
    //           this.router.navigate(['exit/profile']);
    //         } else {
    //           this.router.navigate(['/']);
    //         }
    //       } else {
    //         console.error('Profile employee not found in response.');
    //         this.router.navigate(['/']);
    //       }
    //     } else {
    //       this.invalidCreds = true;
    //     }
    //   },
    //   (error) => {
    //     this.isLoading = false; // Stop loader on error

    //     // ✅ Ensure the form remains filled
    //     this.invalidCreds = true;
    //     this.submit = true;
    //     this.formsubmit = true;

    //     console.error('Login failed:', error);
    //   }
    // );
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
  // encryptCredentials(credentials: any): string {
  //   try {
  //     const credentialsString = JSON.stringify(credentials);
  //     const key = 'Xaa3Mivmz5Tllvq';
  //     return CryptoJS.AES.encrypt(credentialsString, key).toString();
  //   } catch (error) {
  //     throw new Error('Encryption failed');
  //   }
  // }
// Navigates to the forgot password page - (Vaishnavi)
  forgetPassword() {
    this.router.navigate(['/auth/reset-password']);
  }
}
