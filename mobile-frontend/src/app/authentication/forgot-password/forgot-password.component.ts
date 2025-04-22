import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  forgotPasswordForm!: FormGroup;
  isLoading = false;
  emailSent = false;
  emailNotFound = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading = true;
    this.emailSent = false;
    this.emailNotFound = false;

    const email = this.forgotPasswordForm.value.email;

    // Simulated response (replace with actual API call)
    setTimeout(() => {
      this.isLoading = false;

      if (email === 'admin@example.com') {
        this.emailSent = true;
      } else {
        this.emailNotFound = true;
      }
    }, 1500);
  }

}
