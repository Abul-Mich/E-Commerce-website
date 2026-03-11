import { Component, output, signal } from '@angular/core';
import { SortOption, ISortOptionItem } from '../sort-banner';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.scss'],
})
export class DropdownComponent {
  readonly sortChanged = output<SortOption>();

  readonly sortOptions = signal<ISortOptionItem[]>([
    { label: 'Best Selling', value: 'best-selling' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest', value: 'newest' },
    { label: 'Top Rated', value: 'rating' },
  ]);

  readonly selectedOption = signal<ISortOptionItem>(this.sortOptions()[0]);
  readonly isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  selectOption(option: ISortOptionItem): void {
    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.sortChanged.emit(option.value);
  }
}
