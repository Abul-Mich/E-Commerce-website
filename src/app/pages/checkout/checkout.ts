// checkout.component.ts

import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// import { PaymentCard } from '../payment-options/payment-options.component'; // adjust path
import { CartService } from '../../core/services/cart';
import { PaymentCard } from '../account/payment-options/payment-options';

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

  // ── Payment cards from localStorage ───────────────────────────────────────
  readonly cards = signal<PaymentCard[]>(this.loadCards());
  readonly selectedCardId = signal<string | null>(
    localStorage.getItem('default_payment_id'), // ← pre-select from stored ID
  );

  // ── UI state ──────────────────────────────────────────────────────────────
  // readonly selectedCardId = signal<string | null>(
  //   this.loadCards().find((c) => c.isDefault)?.id ?? null,
  // );
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly selectedCard = computed(
    () => this.cards().find((c) => c.id === this.selectedCardId()) ?? null,
  );

  readonly shipping = computed(() => (this.cart.totalPrice() >= 50 ? 0 : 9.99));

  readonly orderTotal = computed(() => this.cart.totalPrice() + this.shipping());

  readonly canOrder = computed(
    () => !!this.selectedCardId() && this.cart.hasItems() && !this.isLoading(),
  );

  // ── Load cards from localStorage ──────────────────────────────────────────
  private loadCards(): PaymentCard[] {
    try {
      const raw = localStorage.getItem('payment_cards');
      return raw ? (JSON.parse(raw) as PaymentCard[]) : [];
    } catch {
      return [];
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
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
        next: (res) => {
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

  // ── Formatting ────────────────────────────────────────────────────────────
  formatPrice(n: number): string {
    return n.toFixed(2);
  }

  maskedNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
  }
}
