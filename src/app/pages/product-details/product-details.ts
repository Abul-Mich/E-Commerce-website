import { AuthService } from './../../core/services/auth-service';
import { Component, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../shared/models/product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { CartService } from '../../core/services/cart';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-details',
  imports: [FormsModule, ProductCard],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.productService.getProductById(id)),
    ),
    { initialValue: null },
  );

  readonly allProducts = this.productService.products;

  readonly similarProducts = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.allProducts()
      .filter((p) => p.category === current.category && p.id !== current.id)
      .slice(0, 4);
  });

  readonly quantity = signal<number>(1);
  readonly showNotification = signal<boolean>(false);
  readonly notificationMessage = signal<string>('');

  readonly totalPrice = computed(() => ((this.product()?.price ?? 0) * this.quantity()).toFixed(2));

  readonly canIncrement = computed(
    () => !this.cartService.isQuantityMaxed(this.quantity(), undefined),
  );

  get stars(): string {
    const rate = this.product()?.rating.rate;
    const full = Math.floor(rate!);
    const half = rate! % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  }
  constructor() {
    effect(() => {
      this.product();
      this.quantity.set(1);
    });
  }

  onCardClick(product: IProduct): void {
    this.router.navigate(['/products', product.id]);
  }

  incrementQuantity(): void {
    if (this.canIncrement()) this.quantity.update((q) => q + 1);
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

    setTimeout(() => this.showNotification.set(false), 2000);
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
