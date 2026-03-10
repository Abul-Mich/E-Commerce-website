import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  passwordMatchValidator,
  strongPasswordValidator,
  noWhitespaceValidator,
} from '../../../shared/validators/custom-validators';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserRequest } from '../../../core/models/User';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly signupSuccess = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal('');

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

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerPayload } = this.signupForm.value;
    this.isLoading.set(true);
    this.error.set('');

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
          this.signupSuccess.set(true);
          this.isLoading.set(false);
          setTimeout(() => this.router.navigate(['/products']), 1500);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Signup failed. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  toggleVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') this.showPassword.update((v) => !v);
    if (field === 'confirm') this.showConfirmPassword.update((v) => !v);
  }
}
