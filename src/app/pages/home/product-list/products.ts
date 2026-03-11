import { Component, inject, signal, computed, input, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { toSignal } from '@angular/core/rxjs-interop';
import { IProduct } from '../../../shared/models/product';
import { FilterState } from '../filter/filter';
import { SortOption, ViewMode } from '../sort-banner/sort-banner';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { map } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly filters = input<FilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 1000,
    ratingMin: 0,
  });

  readonly sort = input<SortOption>('best-selling');
  readonly viewMode = input<ViewMode>('grid');

  readonly products = toSignal(this.productService.getProducts(), { initialValue: [] });

  readonly searchQuery = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get('search')?.toLowerCase().trim() ?? ''),
    ),
    { initialValue: '' },
  );

  readonly filteredProducts = computed(() => {
    const f = this.filters();
    const search = this.searchQuery();

    return this.products().filter((p) => {
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

  readonly sortedProducts = computed(() => {
    const products = [...this.filteredProducts()];
    switch (this.sort()) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'rating':
        return products.sort((a, b) => b.rating.rate - a.rating.rate);
      case 'newest':
        return products.sort((a, b) => b.id - a.id);
      case 'best-selling':
      default:
        return products.sort((a, b) => b.rating.count - a.rating.count);
    }
  });

  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(9);

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.sortedProducts().slice(start, start + this.itemsPerPage());
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.sortedProducts().length / this.itemsPerPage()),
  );

  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  constructor() {
    effect(() => {
      this.filters();
      this.sort();
      this.searchQuery();
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
}
