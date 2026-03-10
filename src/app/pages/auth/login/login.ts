import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { noWhitespaceValidator } from '../../../shared/validators/custom-validators';
import { AuthService } from '../../../core/services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, noWhitespaceValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly loginSuccess = signal(false);
  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal('');

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set('');

    this.authService
      .login({
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loginSuccess.set(true);
          this.isLoading.set(false);
          setTimeout(() => this.router.navigate(['/products']), 1500);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed. Please try again.');
          this.loginSuccess.set(false);
          this.isLoading.set(false);
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
