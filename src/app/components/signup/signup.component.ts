import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { passwordMatchValidator, strongPasswordValidator, noWhitespaceValidator } from '../../validators/custom-validators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  signupSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), noWhitespaceValidator()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Signup form submitted:', this.signupForm.value);
      this.signupSuccess = true;
      
      // Simulate registration and redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }
}
