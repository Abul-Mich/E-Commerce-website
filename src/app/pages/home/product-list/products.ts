import { Component, inject, output, signal, computed, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AddButton } from './components/add-button/add-button';
import { IProduct } from '../../../models/product';
import { FilterState } from '../filter/filter'; // adjust path
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { map } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, AddButton, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  selectedProduct = signal<IProduct | null>(null);
  product = output<IProduct>();

  // ── Filters input from HomeComponent ─────────────────────────────────────
  readonly filters = input<FilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 1000,
    ratingMin: 0,
  });

  // ── Raw products from API ─────────────────────────────────────────────────
  readonly products = toSignal(this.productService.getProducts(), { initialValue: [] });

  private readonly route = inject(ActivatedRoute);

  readonly searchQuery = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get('search')?.toLowerCase().trim() ?? ''),
    ),
    { initialValue: '' },
  );

  // ── Update filteredProducts computed to also apply search ─────────────────────
  readonly filteredProducts = computed(() => {
    const f = this.filters();
    const search = this.searchQuery();
    const all = this.products();

    return all.filter((p) => {
      const matchesCategory = f.categories.length === 0 || f.categories.includes(p.category);
      const matchesPrice = p.price >= f.priceMin && p.price <= f.priceMax;
      const matchesRating = (p.rating?.rate ?? 0) >= f.ratingMin;
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search);

      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });
  });

  // pagination state
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(9); // 3 columns × 3 rows

  // slice filteredProducts for current page
  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProducts().slice(start, end);
  });

  // total pages
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.itemsPerPage()),
  );

  // page numbers array for template
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // reset to page 1 when filters change
  constructor() {
    effect(() => {
      this.filters(); // track filters signal
      this.currentPage.set(1);
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCardClick(product: IProduct): void {
    this.router.navigate(['/products', product.id]);
  }

  onProductClick(product: IProduct): void {
    this.selectedProduct.set(product);
  }
}
