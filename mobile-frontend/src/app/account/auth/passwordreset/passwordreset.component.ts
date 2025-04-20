import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})

export class PasswordresetComponent implements OnInit {
  emailError: boolean = false;
  otpValue: string = '';
  stepIndex: { stepIndex: number; };
  userEmail: string;
  interval: any;
  loginOtpTimeStatus: boolean;
  otpTime: number;
  otpError: boolean = false;
  currentOTP: any;
  otpErrorMsg: any;
  verifyOTPForm: boolean = true;
  password: string;
  resetForm: FormGroup;
  passwordForm: FormGroup;
  show: boolean;
  pwdError = false;
  loggedUser: any;
  emailId: string;
  formSection: boolean = true;
  passwordSection: boolean = false;
  otpSection: boolean = false;

  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "60px",
      height: "50px",
    },
  }
  disableButton: boolean = true;
  otpValid: boolean = false;
  recoverPwdForm: UntypedFormGroup;
  user: any;
  email: any;

  constructor(public router: Router, public service: AuthService, private authService: AuthenticationService, private formBuilder: FormBuilder) {
    this.user = JSON.parse(localStorage.getItem("payoutUser"));
  }


  ngOnInit(): void {

    this.passwordForm = this.formBuilder.group({
      newPwd: ['', [Validators.required]],
      confirmPwd: ['', [Validators.required]],
    });

    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.resetForm.controls;
  }

  get formError() {
    return this.passwordForm.controls;
  }


  // Checks if OTP input is valid (i.e., length is 6) - (Vaishnavi)
  isOtpValid(): boolean {
    return this.otpValue.length === 6;
  }

  // Updates OTP value as the user types - (Vaishnavi)
  onOtpChange(event: string) {
    this.otpValue = event;
  }

  // Verifies if the entered email exists  - (Vaishnavi)
  async checkEmail(email: string) {
    this.emailError = false;
    (await this.service.verifyUser(email)).subscribe(
      (res: boolean) => {
        this.emailError = res;
      },
      (error) => {
        console.error('Error verifying email:', error);
      }
    );
  }

  // Starts the timer for OTP validity - (Vaishnavi)
  startTimer() {
    clearInterval(this.interval);
    this.loginOtpTimeStatus = true;
    this.otpTime = 300;
    this.interval = setInterval(() => {
      if (this.otpTime > 1) {
        if (this.otpTime == 61) {
          this.otpTime = this.otpTime - 2;
        } else {
          this.otpTime--;
        }
      } else {
        this.loginOtpTimeStatus = false;
        clearInterval(this.interval);
        return;
      }
    }, 1000);
  }

  // Submits the email form to initiate OTP generation - (Vaishnavi)
  async onSubmit() {
    let obj = {}
    obj['email'] = this.resetForm.value.email;
    if (this.resetForm.valid) {
      (await this.service.generateOtpForCompany(obj)).subscribe((res: any) => {
        if (res.success) {
          this.userEmail = res?.email;
          this.formSection = false
          this.otpSection = true
        }
      })
    }
    else {
      return;
    }

  }

  // Validates that new password and confirm password match - (Vaishnavi)
  validateConfirmPwd() {
    this.pwdError = false;
    const password = this.resetForm.get('newPwd').value;
    const confirmPassword = this.resetForm.get('confirmPassword').value;
    if (password !== confirmPassword) {
      this.pwdError = true;
    }
  }

  // Verifies the entered OTP - (Vaishnavi)
  async verifyOtp() {
    this.otpError = false;
    if (this.otpValue) {
      let obj: any = { otp: this.otpValue };

      (await this.service.verifyOtpForCompany(this.userEmail, obj)).subscribe((res: any) => {
        if (res.success) {
          this.otpValid = true;
          this.otpError = false;
          this.otpErrorMsg = '';
          this.emailId = res.email;
          this.otpSection = false;
          this.passwordSection = true;

        } else {
          this.otpValid = false;
          this.otpError = true;
          this.otpErrorMsg = res?.message || "Incorrect OTP. Please try again.";
        }
      });
    }
  }
  submit() {
    this.formSection = false;
    this.otpSection = false;
    this.passwordSection = true;
  }

  // Updates the user's password if new password and confirmation match - (Vaishnavi)
  async ChangePassword() {
    if (this.passwordForm.value.newPwd == this.passwordForm.value.confirmPwd) {
      let pwdObj = {};
      pwdObj['password'] = this.passwordForm.value.newPwd;
      (await this.service.updatePassword(this.userEmail, pwdObj)).subscribe((res: any) => {
        if (res.success) {
          if (this.loggedUser) {
            this.authService.logout();
          }
          this.router.navigate(['/auth/login-2']);
        }
      })
    }
    else {
      this.pwdError = true
    }
  }

  // Resends the OTP to the user's email - (Vaishnavi)
  async resendOtp() {
    this.startTimer();
    this.otpError = false;
    this.currentOTP = undefined;
    let obj = {}
    obj['email'] = this.resetForm.value.email;
    (await this.service.generateOtpForCompany(obj)).subscribe((res: any) => {
      if (res.success) {
        this.userEmail = res.email;
      }
    })
  }

  onOTPInputChange(v) {
    this.currentOTP = v;
  }

  // new password
  onClick() {
    if (this.password === "password") {
      this.password = "text";
      this.show = true;
    } else {
      this.password = "password";
      this.show = false;
    }
  }

}