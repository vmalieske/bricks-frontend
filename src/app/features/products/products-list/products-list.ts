import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackendService } from '../../../core/services/backend.service';
import { Product } from '../../../core/models/product.types';
import { ProductCard } from '../components/product-card/product-card';

@Component({
  selector: 'app-products-list',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ProductCard, RouterModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  standalone: true,
})
export class ProductsListComponent implements OnInit {
  #backend = inject(BackendService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  navigateToEdit(id: string) {
    this.#router.navigate(['/sets', id, 'edit']);
  }

  deleteProduct(id: string) {
    this.#backend.deleteProduct(id).subscribe({
      next: () => {
        this.products.update((products) => products.filter((p) => p.id !== id));
      },
    });
  }

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
