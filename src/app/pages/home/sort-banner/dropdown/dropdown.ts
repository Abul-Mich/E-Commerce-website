import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.scss'],
})
export class DropdownComponent {
  sortOptions = signal([
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest', value: 'newest' },
  ]);

  selectedOption = signal<{ label: string; value: string } | null>(this.sortOptions()[0]);
  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  selectOption(option: any) {
    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.onSortChange(option.value);
  }

  onSortChange(value: string) {
    console.log('Sort changed:', value);
  }
}
