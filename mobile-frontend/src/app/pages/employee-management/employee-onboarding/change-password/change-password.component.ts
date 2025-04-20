import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { OwlOptions } from "ngx-owl-carousel-o";
import {Location} from '@angular/common';
import { EmployeeManagementService } from '../../employee-management.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  breadCrumbItems: Array<{}>;
  showOldPassword = false;
  showNewPassword = false;
  resetForm: FormGroup;
  pwdError: boolean;
  emailId: string;
 loggedUser: any;
 oldpass : string;
  password: string;
  show: boolean;
  oldPass : boolean;
  showPassword: boolean = false;
  passwordError: boolean;
  passwordErrorMessage: string = '';
  carouselOption: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: false,
    dots: true,
    responsive: {
      680: {
        items: 1,
      },
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private activeRoute: ActivatedRoute,
    private EmployeeManagementService: EmployeeManagementService,
    private authService: AuthenticationService,
    private router: Router,
    private _location: Location,
  ) {
    this.loggedUser = JSON.parse(localStorage.getItem("payoutUser"));
   }

   ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Reset Password" },
      { label: "Logout", active: true },
    ];

    let email = JSON.parse(localStorage.getItem('payoutUser'))
     this.emailId = email?.employee?.basicDetails?.email  

    if (!this.emailId) {
      console.error("Error: Email ID is null or undefined");
    }
  
    this.resetForm = this.formBuilder.group({
      oldPwd: ['', Validators.required],
      
      newPwd: ['', [
        Validators.required,
        Validators.minLength(8),  
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],

      confirmPwd: ['', Validators.required]
    }, { validator: this.passwordMatchValidator }); 
  }

  passwordMatchValidator(form: FormGroup) {
    const newPwd = form.get('newPwd')?.value;
    const confirmPwd = form.get('confirmPwd')?.value;
    return newPwd === confirmPwd ? null : { mustMatch: true };
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  get form() { return this.resetForm.controls; }

  async onSubmit()
  {
    let pwdObj = {};
    pwdObj['password'] = this.encryptCredentials(this.resetForm.value.newPwd); // Encrypt Password
    (await this.EmployeeManagementService.updatePassword(this.emailId, pwdObj)).subscribe((res: any) => {
      if (res.success) {
        if (this.loggedUser) {
          this.authService.logout();
          this.router.navigate(['/auth/login-2']);
        } else {
          this.authService.logout();
        }
      }
  });
}

  validateConfirmPwd() {
    this.pwdError = this.resetForm.value.newPwd !== this.resetForm.value.confirmPwd;
  }

  cancel() {
    this.router.navigate(['/account/login']);
  }


  onClick() {
    this.password = this.password === "password" ? "text" : "password";
    this.show = !this.show;
  }

  async checkPassword(event) {
    this.passwordError = false;
    if (!this.form.pass.errors) {
      const obj = { password: this.resetForm.value.pass, email: this.emailId };
      (await this.EmployeeManagementService.verifyPassword(obj)).subscribe((res: any) => {
        this.passwordError = !res.success;
        if (this.passwordError) {
          this.passwordErrorMessage = 'Old password does not match';
        }
      });
    }
  }


// Encrypts user credentials before sending them to the server - (Pooja)
   encryptCredentials(credentials: any): string {
     try {
       const credentialsString = JSON.stringify(credentials);
       const key = 'Xaa3Mivmz5Tllvq';
       return CryptoJS.AES.encrypt(credentialsString, key).toString();
     } catch (error) {
       throw new Error('Encryption failed');
     }
   }

  backURL() {
    this._location.back();
  }
}