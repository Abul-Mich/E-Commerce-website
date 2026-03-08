import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from './dropdown/dropdown';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'best-selling' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

interface SortOptionItem {
  value: SortOption;
  label: string;
}

@Component({
  selector: 'app-sort-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  templateUrl: './sort-banner.html',
  styleUrl: './sort-banner.scss',
})
export class SortBannerComponent {
  sortChanged = output<SortOption>();
  viewModeChanged = output<ViewMode>();

  selectedSort: SortOption = 'best-selling';
  viewMode: ViewMode = 'grid';

  sortOptions: SortOptionItem[] = [
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  onSortChange(value: SortOption): void {
    this.sortChanged.emit(value);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.viewModeChanged.emit(mode);
  }
}
