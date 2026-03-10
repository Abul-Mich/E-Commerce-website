import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-add-button',
  imports: [],
  templateUrl: './add-button.html',
  styleUrl: './add-button.scss',
})
export class AddButton {
  private quantity = signal(0);

  readonly qty = computed(() => this.quantity());

  add() {
    this.quantity.update((q) => q + 1);
  }

  remove() {
    this.quantity.update((q) => Math.max(0, q - 1));
  }

  reset() {
    this.quantity.set(1);
  }
}
