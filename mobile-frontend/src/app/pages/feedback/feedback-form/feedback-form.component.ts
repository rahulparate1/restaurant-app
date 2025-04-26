import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FeedbackService } from '../feedback.service';
import { Router } from '@angular/router';


const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.css'
})
export class FeedbackFormComponent {

  feedbackForm!: FormGroup;
  selectedRating: number | null = null;
  numbers = Array.from({ length: 10 }, (_, i) => i + 1); // [1,2,3,...,10]

  constructor(
    private fb: FormBuilder,
    private service: FeedbackService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      description: ['']
    });
  }

  get form() {
    return this.feedbackForm.controls;
  }

// Method to handle rating selection
selectRating(num: number): void {
  this.selectedRating = num;
  this.feedbackForm.patchValue({ rating: num });
}

// Form submit method

  async onSubmit(): Promise<void> {
  if (this.feedbackForm.invalid) {
    this.feedbackForm.markAllAsTouched();
    return;
  }

  const payload = {
    customerName: this.feedbackForm.get('customerName')?.value,
    rating: this.selectedRating,
    description: this.feedbackForm.get('description')?.value
  };

  let url = 'http://127.0.0.1:3000/feedbacks';
 (await this.service.submitFeedback(url,payload)).subscribe(
    (res) => {
      Swal.fire({
        icon: 'success',
        title: 'Thank you! 😊',
        text: 'We appreciate your feedback. Come back soon!',
        confirmButtonColor: '#ce1212'
      }).then(() => {
        this.feedbackForm.reset();
        this.selectedRating = null;
        this.router.navigate(['/dashboard']);
      });
    },
    (error) => {
      console.error('Feedback API Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#ce1212'
      });
    }
  );
}





}
