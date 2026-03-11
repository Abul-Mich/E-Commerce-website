import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CartService } from '../../core/services/cart';
import { IPaymentCard } from '../account/payment-options/payment-options';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(CartService);

  readonly cards = signal<IPaymentCard[]>(this.loadCards());
  readonly selectedCardId = signal<string | null>(localStorage.getItem('default_payment_id'));

  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly selectedCard = computed(
    () => this.cards().find((c) => c.id === this.selectedCardId()) ?? null,
  );

  readonly shipping = computed(() => (this.cart.totalPrice() >= 50 ? 0 : 9.99));

  readonly orderTotal = computed(() => this.cart.totalPrice() + this.shipping());

  readonly canOrder = computed(
    () => !!this.selectedCardId() && this.cart.hasItems() && !this.isLoading(),
  );

  private loadCards(): IPaymentCard[] {
    try {
      const raw = localStorage.getItem('payment_cards');
      return raw ? (JSON.parse(raw) as IPaymentCard[]) : [];
    } catch {
      return [];
    }
  }

  selectCard(id: string): void {
    this.selectedCardId.set(id);
  }

  placeOrder(): void {
    if (!this.canOrder()) return;

    this.error.set('');
    this.isLoading.set(true);

    this.cart
      .checkout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.isLoading.set(false);
          setTimeout(() => this.router.navigate(['/']), 1500);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Order failed. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  formatPrice(n: number): string {
    return n.toFixed(2);
  }

  maskedNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
  }
}
