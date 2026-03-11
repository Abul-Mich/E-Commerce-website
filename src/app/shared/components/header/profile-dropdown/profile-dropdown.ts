import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { IUser } from '../../../models/user';

function getUserFromStorage(): IUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as IUser) : null;
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-dropdown.html',
  styleUrl: './profile-dropdown.scss',
})
export class ProfileDropdownComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly elRef = inject(ElementRef);

  readonly signedOut = output<void>();

  readonly isOpen = signal(false);

  readonly username = computed(() => this.authService.currentUser()?.username ?? 'user');
  readonly firstName = computed(() => this.authService.currentUser()?.firstName ?? '');
  readonly email = computed(() => this.authService.currentUser()?.email ?? '');
  readonly image = computed(
    () => this.authService.currentUser()?.imageUrl || 'icons/profile-icon.svg',
  );
  readonly role = computed(() => this.authService.currentUser()?.role ?? 'Member');

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  async signOut(): Promise<void> {
    this.close();
    this.authService.logout();
    this.signedOut.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
