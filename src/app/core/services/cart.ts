import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ICartItem } from '../../shared/models/cart';

export interface ICartSummary {
  totalItems: number;
  totalPrice: number;
  hasItems: boolean;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly CART_KEY = 'cart';
  private readonly MAX_QUANTITY = 5;
  private readonly MAX_TOTAL = 10;
  private readonly API_URL = 'https://fakestoreapi.com/carts';

  readonly items = signal<ICartItem[]>(this.loadFromStorage());
  readonly isCartFull = computed(() => this.totalItems() >= this.MAX_TOTAL);

  readonly totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  readonly hasItems = computed(() => this.items().length > 0);
  readonly summary = computed<ICartSummary>(() => ({
    totalItems: this.totalItems(),
    totalPrice: this.totalPrice(),
    hasItems: this.hasItems(),
  }));

  constructor() {
    effect(() => this.syncToStorage(this.items()));
  }

  isQuantityMaxed(currentQty: number, stock?: number): boolean {
    return (
      currentQty >= (stock ?? Infinity) || currentQty >= this.MAX_QUANTITY || this.isCartFull()
    );
  }

  addItem(product: Omit<ICartItem, 'quantity'>, quantity = 1): void {
    const stock = Math.min(product.stock ?? Infinity, this.MAX_QUANTITY);
    const remaining = this.MAX_TOTAL - this.totalItems();
    if (remaining <= 0) return;

    const actualQty = Math.min(quantity, remaining);

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

  removeItem(productId: number): void {
    this.items.update((cart) => cart.filter((i) => i.productId !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const currentQty = this.getQuantity(productId);
    const diff = quantity - currentQty;
    const remaining = this.MAX_TOTAL - this.totalItems();
    const finalQty = currentQty + Math.min(diff, remaining);

    this.items.update((cart) =>
      cart.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(finalQty, i.stock ?? Infinity, this.MAX_QUANTITY) }
          : i,
      ),
    );
  }

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

  isInCart(productId: number): boolean {
    return this.items().some((i) => i.productId === productId);
  }

  getQuantity(productId: number): number {
    return this.items().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  clearCart(): void {
    this.items.set([]);
  }

  checkout(): Observable<unknown> {
    const products = this.items().map((c) => ({
      productId: c.productId,
      title: c.name,
      price: c.price,
      category: c.category,
      quantity: c.quantity,
    }));
    return this.http
      .post(this.API_URL, { id: 0, userId: 0, products })
      .pipe(tap(() => this.clearCart()));
  }

  private loadFromStorage(): ICartItem[] {
    try {
      const raw = localStorage.getItem(this.CART_KEY);
      return raw ? (JSON.parse(raw) as ICartItem[]) : [];
    } catch {
      return [];
    }
  }

  private syncToStorage(cart: ICartItem[]): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    } catch {
      console.warn('CartService: failed to sync cart to localStorage');
    }
  }
}
