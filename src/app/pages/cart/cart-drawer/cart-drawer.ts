import { Component, inject, computed, output, input } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../core/services/cart';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawerComponent {
  private readonly router = inject(Router);
  readonly cart = inject(CartService);

  readonly isOpen = input<boolean>(false);
  readonly closed = output<void>();

  readonly formattedTotal = computed(() => this.cart.totalPrice().toFixed(2));

  close(): void {
    this.closed.emit();
  }

  goToCart(): void {
    this.close();
    this.router.navigate(['/cart']);
  }

  goToCheckout(): void {
    this.close();
    this.router.navigate(['/checkout']);
  }

  increment(productId: number): void {
    this.cart.increment(productId);
  }

  decrement(productId: number): void {
    this.cart.decrement(productId);
  }

  remove(productId: number): void {
    this.cart.removeItem(productId);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  itemTotal(item: CartItem): string {
    return (item.price * item.quantity).toFixed(2);
  }
}
