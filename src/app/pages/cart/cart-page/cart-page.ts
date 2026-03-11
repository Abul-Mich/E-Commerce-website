import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart';
import { ICartItem } from '../../../shared/models/cart';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPageComponent {
  private readonly router = inject(Router);
  readonly cart = inject(CartService);

  readonly shipping = computed(() => (this.cart.totalPrice() >= 50 ? 0 : 9.99));

  readonly orderTotal = computed(() => this.cart.totalPrice() + this.shipping());

  readonly freeShippingRemaining = computed(() => Math.max(0, 50 - this.cart.totalPrice()));

  readonly freeShippingProgress = computed(() =>
    Math.min(100, (this.cart.totalPrice() / 50) * 100),
  );

  increment(productId: number): void {
    this.cart.increment(productId);
  }
  decrement(productId: number): void {
    this.cart.decrement(productId);
  }
  remove(productId: number): void {
    this.cart.removeItem(productId);
  }
  clearCart(): void {
    this.cart.clearCart();
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(n: number): string {
    return n.toFixed(2);
  }
  itemTotal(item: ICartItem): string {
    return (item.price * item.quantity).toFixed(2);
  }
}
