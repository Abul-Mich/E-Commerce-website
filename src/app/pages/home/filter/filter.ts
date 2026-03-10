import { Component, input, output, signal, computed, effect } from '@angular/core';

export interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  ratingMin: number;
}

// const DEFAULT_FILTER: FilterState = {
//   categories: [],
//   priceMin: 0,
//   priceMax: 1000,
//   ratingMin: 0,
// };

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
})
export class FilterComponent {
  readonly categories = input<string[]>([]);

  readonly maxPrice = input<number>(1000);

  readonly filterChange = output<FilterState>();

  readonly selectedCategories = signal<string[]>([]);
  readonly priceMin = signal<number>(0);
  readonly priceMax = signal<number>(1000);
  readonly ratingMin = signal<number>(0);

  readonly categoriesOpen = signal(true);
  readonly priceOpen = signal(true);
  readonly ratingOpen = signal(true);

  readonly hasActiveFilters = computed(
    () =>
      this.selectedCategories().length > 0 ||
      this.priceMin() > 0 ||
      this.priceMax() < this.maxPrice() ||
      this.ratingMin() > 0,
  );

  readonly activeCount = computed(() => {
    let count = 0;
    if (this.selectedCategories().length > 0) count++;
    if (this.priceMin() > 0 || this.priceMax() < this.maxPrice()) count++;
    if (this.ratingMin() > 0) count++;
    return count;
  });

  readonly stars = [1, 2, 3, 4, 5];

  constructor() {
    effect(() => {
      this.filterChange.emit({
        categories: this.selectedCategories(),
        priceMin: this.priceMin(),
        priceMax: this.priceMax(),
        ratingMin: this.ratingMin(),
      });
    });
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((cats) =>
      cats.includes(category) ? cats.filter((c) => c !== category) : [...cats, category],
    );
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  onPriceMinChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;

    this.priceMin.set(Math.min(val, this.priceMax() - 1));
  }

  onPriceMaxChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;

    this.priceMax.set(Math.max(val, this.priceMin() + 1));
  }

  setRating(rating: number): void {
    this.ratingMin.set(this.ratingMin() === rating ? 0 : rating);
  }

  clearAll(): void {
    this.selectedCategories.set([]);
    this.priceMin.set(0);
    this.priceMax.set(this.maxPrice());
    this.ratingMin.set(0);
  }

  toggle(section: 'categories' | 'price' | 'rating'): void {
    if (section === 'categories') this.categoriesOpen.update((v) => !v);
    if (section === 'price') this.priceOpen.update((v) => !v);
    if (section === 'rating') this.ratingOpen.update((v) => !v);
  }

  formatLabel(cat: string): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  }
}
