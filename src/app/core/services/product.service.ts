import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProduct } from '../../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://fakestoreapi.com/products';

  getProducts() {
    return this.http.get<IProduct[]>(this.API_URL);
  }

  getProductById(id: number) {
    return this.http.get<IProduct>(`${this.API_URL}/${id}`);
  }
}
