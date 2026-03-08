import { Component, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { HeroBannerComponent } from './hero-banner/hero-banner';
import { ProductsComponent } from './product-list/products';
import { SortBannerComponent } from './sort-banner/sort-banner';
import { FilterComponent, FilterState } from './filter/filter';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent, ProductsComponent, SortBannerComponent, FilterComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly productsService = inject(ProductService);

  readonly allProducts = this.productsService.products;

  readonly categories = computed(() =>
    [...new Set(this.allProducts().map((p) => p.category))].filter(Boolean).sort(),
  );

  readonly maxPrice = computed(() =>
    Math.ceil(Math.max(...this.allProducts().map((p) => p.price), 100)),
  );

  readonly activeFilters = signal<FilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 1000,
    ratingMin: 0,
  });

  onFilterChange(filters: FilterState): void {
    this.activeFilters.set(filters);
  }
}
