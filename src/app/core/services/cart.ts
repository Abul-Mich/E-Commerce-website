import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  description: string;
  stock?: number; // max allowed quantity
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  hasItems: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly CART_KEY = 'cart';
  private readonly MAX_QUANTITY = 5;
  private readonly MAX_TOTAL = 10; // across all items

  private readonly API_URL = 'https://fakestoreapi.com/carts';

  // ── State ──────────────────────────────────────────────────────────────────
  readonly items = signal<CartItem[]>(this.loadFromStorage());
  readonly isCartFull = computed(() => this.totalItems() >= this.MAX_TOTAL);

  // ── Computed ───────────────────────────────────────────────────────────────

  /** Total number of individual units across all items — used for header badge */
  readonly totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  /** Total price across all items */
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  /** Whether the cart has any items */
  readonly hasItems = computed(() => this.items().length > 0);

  /** Full summary object — useful to pass to checkout */
  readonly summary = computed<CartSummary>(() => ({
    totalItems: this.totalItems(),
    totalPrice: this.totalPrice(),
    hasItems: this.hasItems(),
  }));

  // ── Auto-sync to localStorage on every change ──────────────────────────────
  constructor() {
    effect(() => {
      // effect re-runs whenever items() changes
      this.syncToStorage(this.items());
    });
  }

  isQuantityMaxed(currentQty: number, stock?: number): boolean {
    return (
      currentQty >= (stock ?? Infinity) || currentQty >= this.MAX_QUANTITY || this.isCartFull()
    );
  }
  // ── Add item ───────────────────────────────────────────────────────────────
  // cart.service.ts
  addItem(product: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const stock = Math.min(product.stock ?? Infinity, this.MAX_QUANTITY);

    // how many slots are left in the total cart
    const remaining = this.MAX_TOTAL - this.totalItems();
    if (remaining <= 0) return; // cart is full

    const actualQty = Math.min(quantity, remaining); // can't add more than remaining

    this.items.update((cart) => {
      const existing = cart.find((i) => i.productId === product.productId);
      if (existing) {
        return cart.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: Math.min(i.quantity + actualQty, stock) }
            : i,
        );
      }
      return [...cart, { ...product, quantity: Math.min(actualQty, stock) }];
    });
  }

  // ── Remove item entirely ───────────────────────────────────────────────────
  removeItem(productId: number): void {
    this.items.update((cart) => cart.filter((i) => i.productId !== productId));
  }

  // ── Update quantity ────────────────────────────────────────────────────────
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const currentQty = this.getQuantity(productId);
    const diff = quantity - currentQty; // how much we're trying to add
    const remaining = this.MAX_TOTAL - this.totalItems(); // slots left
    const allowedDiff = Math.min(diff, remaining); // can't exceed total cap
    const finalQty = currentQty + allowedDiff;

    this.items.update((cart) =>
      cart.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(finalQty, i.stock ?? Infinity, this.MAX_QUANTITY) }
          : i,
      ),
    );
  }
  // ── Increment / Decrement helpers ──────────────────────────────────────────
  increment(productId: number): void {
    const item = this.items().find((i) => i.productId === productId);
    if (!item) return;
    this.updateQuantity(productId, item.quantity + 1);
  }

  decrement(productId: number): void {
    const item = this.items().find((i) => i.productId === productId);
    if (!item) return;
    this.updateQuantity(productId, item.quantity - 1);
  }

  // ── Check if item is in cart ───────────────────────────────────────────────
  isInCart(productId: number): boolean {
    return this.items().some((i) => i.productId === productId);
  }

  /** Returns the quantity of a specific item — 0 if not in cart */
  getQuantity(productId: number): number {
    return this.items().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  // ── Clear cart — call after successful order ───────────────────────────────
  clearCart(): void {
    this.items.set([]);
    // effect will sync the empty array to localStorage automatically
  }

  // ── Build order payload for the API ───────────────────────────────────────
  getOrderPayload(): {
    id: number;
    title: string;
    price: number;
    image: string;
    category: string;
    description: string;
  }[] {
    return this.items().map((c: CartItem) => ({
      id: c.productId,
      title: c.name,
      price: c.price,
      image: c.image,
      category: c.category,
      description: c.description,
    }));
  }

  checkout(): Observable<any> {
    const products = computed(() =>
      this.items().map((c: CartItem) => ({
        productId: c.productId,
        title: c.name,
        price: c.price,
        category: c.category,
        quantity: c.quantity,
      })),
    );
    return this.http
      .post(this.API_URL, { id: 0, userId: 0, products: this.getOrderPayload() })
      .pipe(tap(() => this.clearCart()));
  }

  // ── localStorage helpers ───────────────────────────────────────────────────
  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private syncToStorage(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    } catch {
      console.warn('CartService: failed to sync cart to localStorage');
    }
  }
}
