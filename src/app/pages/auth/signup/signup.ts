import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  passwordMatchValidator,
  strongPasswordValidator,
  noWhitespaceValidator,
} from '../../../shared/validators/custom-validators';
import { first, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserRequest } from '../../../core/models/User';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  readonly signupForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), noWhitespaceValidator()]],
      lastName: ['', [Validators.required, Validators.minLength(2), noWhitespaceValidator()]],
      username: ['', [Validators.required, Validators.minLength(3), noWhitespaceValidator()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator() },
  );

  signupSuccess = false;
  isLoading = false;

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { confirmPassword, ...registerPayload } = this.signupForm.value;
      this.isLoading = true;

      this.authService
        .register(registerPayload as IUserRequest)
        .pipe(
          switchMap(() =>
            this.authService.login({
              email: this.signupForm.value.email!,
              password: this.signupForm.value.password!,
            }),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.signupSuccess = true;
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/products']), 2000);
          },
          error: (err) => {
            console.error('Signup or login failed', err);
            this.isLoading = false;
          },
        });
    }
  }
  togglefieldVisibility(field: WritableSignal<boolean>): void {
    field.set(!field());
  }
}
