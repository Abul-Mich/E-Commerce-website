import { Component, inject, input } from '@angular/core';
import { IProduct } from '../../models/product';
import { Router } from '@angular/router';
import { ViewMode } from '../../../pages/home/sort-banner/sort-banner';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  private readonly router = inject(Router);

  readonly product = input.required<IProduct>();
  readonly viewMode = input<ViewMode>('grid');

  get stars(): string {
    const rate = this.product().rating.rate;
    const full = Math.floor(rate);
    const half = rate % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  }

  onCardClick(): void {
    this.router.navigate(['/products', this.product().id]);
  }
}
