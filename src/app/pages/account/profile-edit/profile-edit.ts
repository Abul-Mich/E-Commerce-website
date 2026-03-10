import { Component, inject, signal, DestroyRef } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserResponse } from '../../../core/models/User';
import { UpdateUserPayload, UserService } from '../../../core/services/user';
import { AccountComponent } from '../account';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, AccountComponent],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly storedUser = this.getStoredUser();
  readonly isLoading = signal(false);
  readonly saveSuccess = signal(false);
  readonly error = signal('');
  readonly avatarPreview = signal<string>(this.getStoredImage());
  readonly showCurrentPw = signal(false);
  readonly showNewPw = signal(false);
  readonly showConfirmPw = signal(false);

  private getStoredUser() {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private getStoredImage(): string {
    return this.storedUser?.image || '';
  }

  readonly form = this.fb.group({
    firstName: [this.storedUser?.firstName ?? '', [Validators.required]],
    lastName: [this.storedUser?.lastName ?? '', [Validators.required]],
    username: [this.storedUser?.username ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.storedUser?.email ?? '', [Validators.required, Validators.email]],
    dateOfBirth: [this.storedUser?.dateOfBirth?.slice(0, 10) ?? ''],

    passwords: this.fb.group(
      {
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(6)]],
        confirmPassword: [''],
      },
      { validators: passwordMatchValidator },
    ),
  });

  get pw() {
    return this.form.get('passwords')!;
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saveSuccess.set(false);
    this.error.set('');
    this.isLoading.set(true);

    const { passwords, ...profileFields } = this.form.value;

    const payload: UpdateUserPayload = {
      ...profileFields,
    };

    if (this.avatarPreview() !== this.getStoredImage()) {
      payload['imageUrl'] = this.avatarPreview();
    }

    if (passwords?.newPassword) {
      payload['password'] = passwords.newPassword;
    }

    this.userService
      .updateProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedUser: IUserResponse) => {
          const current = this.storedUser;
          localStorage.setItem('auth_user', JSON.stringify({ ...current, ...updatedUser }));

          this.saveSuccess.set(true);
          this.isLoading.set(false);

          this.pw.reset();

          setTimeout(() => this.saveSuccess.set(false), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to save changes. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  togglePw(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPw.update((v) => !v);
    if (field === 'new') this.showNewPw.update((v) => !v);
    if (field === 'confirm') this.showConfirmPw.update((v) => !v);
  }
}
