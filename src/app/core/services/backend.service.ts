import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import type { Product } from '../models/product.types';

@Injectable({ providedIn: 'root' })
export class BackendService {
  private api = inject(ApiService);

  // Products
  getAllProducts() {
    return this.api.get<Product[]>('/products');
  }

  getOwnedProducts() {
    return this.api.get<Product[]>('/products/owned');
  }

  getWishlistProducts() {
    return this.api.get<Product[]>('/products/wishlist');
  }

  getProductById(id: string) {
    return this.api.get<Product>(`/products/${id}`);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.api.post<Product>('/products', product);
  }

  updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
    return this.api.put<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: string) {
    return this.api.delete<{ message: string; id: string }>(`/products/${id}`);
  }
}
