import { Component, inject, input } from '@angular/core';
import { IProduct } from '../../../models/product';
import { ProductService } from '../../../core/services/product.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  private readonly router = inject(Router);

  product = input.required<IProduct>();

  onCardClick(product: IProduct): void {
    this.router.navigate(['/products', product.id]);
  }
}
