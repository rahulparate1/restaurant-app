import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  signupForm!: FormGroup;
  isLoading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      restaurantName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]]
    });
  }

  get form() {
    return this.signupForm.controls;
  }

  async onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    const signupObj = {
      restaurantName: this.signupForm.value.restaurantName,
      email: this.signupForm.value.email,
      mobileNo: this.signupForm.value.mobileNo,
      password: this.signupForm.value.password
    };

    (await this.authService.registerRestaurant(signupObj)).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/auth/login']);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Registration failed:', error);
      }
    );
  }

}
