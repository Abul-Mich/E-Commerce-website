import { Component, signal, output } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'best-selling' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export interface ISortOptionItem {
  value: SortOption;
  label: string;
}

@Component({
  selector: 'app-sort-banner',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './sort-banner.html',
  styleUrl: './sort-banner.scss',
})
export class SortBannerComponent {
  readonly sortChanged = output<SortOption>();
  readonly viewModeChanged = output<ViewMode>();

  readonly selectedSort = signal<SortOption>('best-selling');
  readonly viewMode = signal<ViewMode>('grid');

  readonly sortOptions: ISortOptionItem[] = [
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  onSortChange(value: SortOption): void {
    this.selectedSort.set(value);
    this.sortChanged.emit(value);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.viewModeChanged.emit(mode);
  }
}
