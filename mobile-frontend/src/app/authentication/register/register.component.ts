import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService1 } from '../authentication.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  signupForm: FormGroup;
  isLoading: boolean = false;
  formSection: boolean = true;
  otpSection: boolean = false;
  otpValue: string = '';
  otpLength: number = 6;
  otpTime: number;
  interval: any;
  disableResendButton: boolean = false;
  otpError: boolean = false;
  otpErrorMsg: string = '';
  showPassword: boolean = false;
  userEmail: any;
  submitted: boolean;
  otpDigits: string[] = new Array(6).fill('');


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService1
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      restaurantName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      fullName: ['', Validators.required],
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) return;

    this.isLoading = true;

    const signupData = {
      restaurant: {
        restaurantName: this.signupForm.value.restaurantName
      },
      user: {
        fullName: this.signupForm.value.fullName,
        email: this.signupForm.value.email,
        mobileNo: this.signupForm.value.mobileNo,
        password: this.signupForm.value.password
      }
    };

    (await this.authService.postSignUp(signupData)).subscribe(
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

  async generateOTP() {
    const data = { email: this.signupForm.value.email };
    (await this.authService.generateOtpForCompany(data)).subscribe(
      (res: any) => {
        if (res.success) {
          this.startTimer();
        }
      }
    );
  }

  async verifyOtp() {
    this.otpError = false;
    this.otpErrorMsg = '';
    if (!this.otpValue || this.otpValue.length !== this.otpLength) {
      this.otpError = true;
      this.otpErrorMsg = 'Please enter valid 6-digit OTP.';
      return;
    }

    const data:any = { otp: this.otpValue };
    (await this.authService.verifyOtpForCompany(this.signupForm.value.email, data)).subscribe(
      (res: any) => {
        if (res.success) {
          this.router.navigate(['/auth/login']);
        } else {
          this.otpError = true;
          this.otpErrorMsg = res.message || 'Invalid OTP. Please try again.';
        }
      },
      (error) => {
        this.otpError = true;
        this.otpErrorMsg = 'OTP verification failed. Please try again.';
      }
    );
  }

  async resendOtp() {
    this.disableResendButton = true;
    this.startTimer();
    const data = { email: this.signupForm.value.email };
    (await this.authService.generateOtpForCompany(data)).subscribe();
  }

  startTimer() {
    clearInterval(this.interval);
    this.otpTime = 120;
    this.interval = setInterval(() => {
      if (this.otpTime > 0) {
        this.otpTime--;
      } else {
        clearInterval(this.interval);
        this.disableResendButton = false;
      }
    }, 1000);
  }

  // onOtpChange(value: string) {
  //   this.otpValue = value;
  // }

  handleOtpInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (/^\d$/.test(value)) {  // Check if the input is a valid digit
      this.otpDigits[index] = value;  // Update the digit at the current index
      this.otpValue = this.otpDigits.join('');  // Join all digits into a single OTP value

      // Move focus to the next input element if it exists
      if (input.nextElementSibling) {
        (input.nextElementSibling as HTMLInputElement).focus();
      }
    } else {
      input.value = '';  // Clear the input if it's not a valid digit
    }
  }

  // handleOtpKeyDown(event: KeyboardEvent, index: number) {
  //   const input = event.target as HTMLInputElement;

  //   if (event.key === 'Backspace') {
  //     this.otpDigits[index] = '';  // Clear the current OTP digit
  //     this.otpValue = this.otpDigits.join('');  // Rebuild the OTP value

  //     // Move focus to the previous input field if it exists
  //     if (input.previousElementSibling) {
  //       (input.previousElementSibling as HTMLInputElement).focus();
  //     }
  //   }
  // }

  onOtpChange(event: any, index: number) {
    const value = event.target.value;

    if (/^\d$/.test(value)) {  // Check if input is a digit
      this.otpDigits[index] = value;  // Update the digit in the otpDigits array
      this.otpValue = this.otpDigits.join('');  // Update the full OTP value
      // Automatically move to the next input field
      if (index < 5) {
        (event.target.nextElementSibling as HTMLInputElement)?.focus();
      }
    } else {
      event.target.value = '';  // Clear input if it's not a digit
    }
  }

  handleOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement; // Type casting to HTMLInputElement

    if (event.key === 'Backspace') {
      this.otpDigits[index] = '';  // Clear the current OTP digit
      this.otpValue = this.otpDigits.join('');  // Rebuild the OTP value
      // Move focus to the previous input field if necessary
      if (index > 0 && input.previousElementSibling) {
        (input.previousElementSibling as HTMLInputElement)?.focus();
      }
    }
  }

}
