import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackendService } from '../../../core/services/backend.service';
import { Product } from '../../../core/models/product.types';
import { ProductCard } from '../components/product-card/product-card';

@Component({
  selector: 'app-products-list',
  imports: [MatIconModule, MatProgressSpinnerModule, ProductCard],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  standalone: true,
})
export class ProductsListComponent implements OnInit {
  #backend = inject(BackendService);
  #route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const status = this.#route.snapshot.data['status'];
    let productCall;

    if (status === 'owned') productCall = this.#backend.getOwnedProducts();
    if (status === 'wishlist') productCall = this.#backend.getWishlistProducts();

    productCall?.subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Products could not be loaded!');
      },
    });
  }
}
