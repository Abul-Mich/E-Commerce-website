import { Component, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../core/services/product';
import { HeroBannerComponent } from './hero-banner/hero-banner';
import { ProductsComponent } from './product-list/products';
import { SortBannerComponent, SortOption, ViewMode } from './sort-banner/sort-banner';
import { FilterComponent, IFilterState } from './filter/filter';

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

  readonly activeFilters = signal<IFilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 1000,
    ratingMin: 0,
  });

  readonly activeSort = signal<SortOption>('best-selling');
  readonly activeViewMode = signal<ViewMode>('grid');

  onFilterChange(filters: IFilterState): void {
    this.activeFilters.set(filters);
  }

  onSortChange(sort: SortOption): void {
    this.activeSort.set(sort);
  }

  onViewModeChange(mode: ViewMode): void {
    this.activeViewMode.set(mode);
  }
}
