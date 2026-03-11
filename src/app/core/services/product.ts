import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProduct } from '../../shared/models/product';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://fakestoreapi.com/products';

  private readonly _products = signal<IProduct[]>([]);
  readonly products = this._products.asReadonly();

  constructor() {
    this.http
      .get<IProduct[]>(this.API_URL)
      .pipe(take(1))
      .subscribe((p) => this._products.set(p));
  }

  getProducts() {
    return this.http.get<IProduct[]>(this.API_URL);
  }

  getProductById(id: number) {
    return this.http.get<IProduct>(`${this.API_URL}/${id}`);
  }
}
