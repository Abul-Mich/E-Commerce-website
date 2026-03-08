import { Component, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../models/product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { CartService } from '../../core/services/cart';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, ProductCard],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Product — toSignal handles re-fetch on route param change ─────────────
  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.productService.getProductById(id)),
    ),
    { initialValue: null },
  );

  // ── All products for similar section ──────────────────────────────────────
  readonly allProducts = this.productService.products;

  readonly similarProducts = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.allProducts()
      .filter((p) => p.category === current.category && p.id !== current.id)
      .slice(0, 4);
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly quantity = signal<number>(1);
  readonly showNotification = signal<boolean>(false);
  readonly notificationMessage = signal<string>('');

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly totalPrice = computed(() => ((this.product()?.price ?? 0) * this.quantity()).toFixed(2));

  constructor() {
    // reset quantity when navigating to a different product
    effect(() => {
      this.product(); // track product changes
      this.quantity.set(1);
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  onCardClick(product: IProduct): void {
    this.router.navigate(['/products', product.id]);
  }
  isCartFull(): boolean {
    return this.cartService.isQuantityMaxed(this.quantity());
  }
  isAtMaxQuantity(): boolean {
    return this.cartService.isQuantityMaxed(this.quantity(), undefined);
  }

  incrementQuantity(): void {
    if (!this.isAtMaxQuantity()) this.quantity.update((q) => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.cartService.addItem(
      {
        productId: product.id,
        name: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
      },
      this.quantity(),
    );

    this.notificationMessage.set('Added to cart successfully!');
    this.showNotification.set(true);
    this.quantity.set(1);

    setTimeout(() => this.showNotification.set(false), 3000);
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
