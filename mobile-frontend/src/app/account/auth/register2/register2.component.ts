import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register2',
  templateUrl: './register2.component.html',
  styleUrls: ['./register2.component.scss']
})
export class Register2Component implements OnInit {
  signupForm: FormGroup;
  isLoading: boolean = false;
  registerSection: boolean = true;
  otpSection: boolean = false;
  formSection: boolean = true;
  emailError: boolean = false;
  mobileError: boolean = false;
  companyNameError: boolean = false;
  otpError: boolean = false;
  otpValue: string = '';
  otpTime: number;
  interval: any;
  showPassword: boolean = false;
  pwdError: boolean = false;
  disableResendButton: boolean = false;
  submitted: boolean = false;
  userEmail: string;
  stepIndex: { stepIndex: number };
  otpErrorMsg: any;
  loginOtpTimeStatus: boolean;
  // OTP input configuration
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: { width: '60px', height: '50px' },
  };

  // swiper config
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true
  };

  // set the current year
  year: number = new Date().getFullYear();
  otpLength: number = 6;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      companyName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ]
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  // Check if the entered company name is already in use (vaishnavi)
  async checkCompanyName(companyName: string) {
    this.companyNameError = false;
    (await this.authService.verifyCompanyName(companyName)).subscribe(
      (res) => {
        if (res.exists) {
          this.companyNameError = true;
        } else {
          this.companyNameError = false;
        }
      },
      (error) => {
        console.error('Error verifying company name:', error);
        this.companyNameError = false;
      }
    );
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Check if the entered email is already associated with an account (vaishnavi)
  async checkEmail(email: string) {
    this.emailError = false;
    (await this.authService.verifyUser(email)).subscribe(
      (res) => {
        if (res.exists) {
          this.emailError = true;
        } else {
          this.emailError = false;
        }
      },
      (error) => {
        console.error('Error verifying email:', error);
        this.emailError = false;
      }
    );
  }

  // Check if the mobile number is already associated with an account (vaishnavi)
  async checkMobileNumber(mobileNo: string) {
    this.mobileError = false;
    (await this.authService.verifyNumber(mobileNo)).subscribe(
      (res) => {
        if (res.exists) {
          this.mobileError = true;
        } else {
          this.mobileError = false;
        }
      },
      (error) => {
        console.error('Error verifying email:', error);
        this.mobileError = false;
      }
    );
  }

  // Validate the confirmed password (if required) (vaishnavi)
  validateConfirmPwd() {
    const password = this.signupForm.get('password')?.value;
  }

  // Start OTP timer (vaishnavi)
  startTimer() {
    clearInterval(this.interval);
    this.loginOtpTimeStatus = true;
    this.otpTime = 120;
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

  // Resend OTP function with a timer reset (vaishnavi)
  async resendOtp() {
    this.startTimer();
    this.disableResendButton = true;
    this.otpError = false;

    const email = this.signupForm.value.email;
    (await this.authService.generateOtpForCompany({ email })).subscribe((res: any) => {
      if (res.success) {
        // Handle OTP sent success case
      }
    });
  }

  // Capture the OTP input value (vaishnavi)
  onOtpChange(event: string) {
    console.log('event', event)
    this.otpValue = event;
    console.log('otpValue', this.otpValue)
  }


  // Submit the registration form (vaishnavi)
  async onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    const onboardObj = {
      employee: {
        basicDetails: {
          firstName: this.signupForm.value.firstName,
          email: this.signupForm.value.email,
          mobileNo: this.signupForm.value.mobileNo,
          password: this.signupForm.value.password,
        },
      },
      company: { companyName: this.signupForm.value.companyName },
    };
    (await this.authService.postSignUp(onboardObj)).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.userEmail = res.email;
          this.startTimer();
          this.generateOTP();
          this.otpSection = true;
          this.formSection = false;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error during signup:', error);
      }
    );
  }

  // Generate OTP for email verification (vaishnavi)
  async generateOTP() {
    let obj = {};
    obj['email'] = this.signupForm.value.email;
    if (this.signupForm.valid) {
      (await this.authService.generateOtpForCompany(obj)).subscribe(
        (res: any) => {
          if (res.success) {
            this.stepIndex = { stepIndex: 2 };
            this.userEmail = res?.email;
            this.startTimer();
          }
        }
      );
    } else {
      return;
    }
  }

  termsRoute() {
    this.router.navigate(['/static-pages/term']);
  }

  privacyRoute() {
    this.router.navigate(['/static-pages/privacy']);
  }

  // Verify entered OTP (vaishnavi)
  async verifyOtp() {
    this.otpError = false;
    this.otpErrorMsg = '';
    this.isLoading = true; 
    if (this.otpValue) {
      let obj: any = {
        otp: this.otpValue,
      };

      (
        await this.authService.verifyOtpForCompany(
          this.signupForm.value.email,
          obj
        )
      ).subscribe(
        (res: any) => {
          this.isLoading = false; 
          if (res.success) {
            this.router.navigate(['auth/login-2']);
          } else {
            this.otpError = true;
            this.otpErrorMsg =
              res?.message || 'Verification failed. Please try again.';
          }
        },
        (error) => {
          console.error('Error verifying OTP:', error);
          this.isLoading = false;
          this.otpError = true;
          this.otpErrorMsg = 'Error verifying OTP. Please try again.';
        }
      );
    } else {
      this.isLoading = false;
      this.otpError = true;
      this.otpErrorMsg = 'Please enter OTP.';
    }
  }

  

  // Only allow numeric input for OTP field (vaishnavi)
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }

  // Check if the entered OTP has reached the required length (vaishnavi)
  isOtpComplete(): boolean {
    return this.otpValue.length === this.otpLength;
  }

  // Method to handle Google Sign-In
  handleGoogleSignIn(): void {
    this.authService.googleSignIn().subscribe(
      (res) => {
        console.log('Google Sign-In Success:', res);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Google Sign-In Error:', error);
      }
    );
  }

  // Method to handle Microsoft Sign-In
  handleMicrosoftSignIn(): void {
    this.authService.microsoftSignIn().subscribe(
      (res) => {
        console.log('Microsoft Sign-In Success:', res);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Microsoft Sign-In Error:', error);
      }
    );
  }
}
