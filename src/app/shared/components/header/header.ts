import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { ProfileDropdownComponent } from './profile-dropdown/profile-dropdown';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, ProfileDropdownComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  searchValue = '';

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onSearch(): void {
    console.log('Search:', this.searchValue);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  authCheck(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }
}
