import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { noWhitespaceValidator } from '../shared/validators/custom-validators';
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

  loginSuccess = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  error = signal<string>('');

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      this.authService
        .login({
          email: this.loginForm.value.email!,
          password: this.loginForm.value.password!,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loginSuccess.set(true);
            this.isLoading.set(true);
            setTimeout(() => this.router.navigate(['/products']), 1500);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Login failed. Please try again.');
            this.loginSuccess.set(false);
            this.isLoading.set(false);
          },
        });
    }
  }
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}
