import { Component, inject, input, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileDropdownComponent } from './profile-dropdown/profile-dropdown';
import { CartService } from '../../../core/services/cart';
import { CartDrawerComponent } from '../../../pages/cart/cart-drawer/cart-drawer';
import { SearchBarComponent } from './search-bar/search-bar';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    RouterLink,
    ProfileDropdownComponent,
    CartDrawerComponent,
    SearchBarComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  readonly cart = inject(CartService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  readonly cartOpen = signal(false);
}
