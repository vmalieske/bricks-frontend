import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackendService } from '../../../core/services/backend.service';
import { Product } from '../../../core/models/product.types';
import { ProductCard } from '../components/product-card/product-card';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';

@Component({
  selector: 'app-products-list',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ProductCard, RouterModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProductsListComponent implements OnInit {
  #backend = inject(BackendService);
  #route = inject(ActivatedRoute);
  #navigate = inject(NavigationHandlerService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  updatingPrices = signal(false);

  isWishlist = computed(() => this.#route.snapshot.data['status'] === 'wishlist');

  navigateToNewProduct() {
    this.#navigate.toNewProduct();
  }

  navigateToEdit(id: string) {
    this.#navigate.toEdit(id);
  }

  navigateToDetail(id: string) {
    this.#navigate.toDetailPage(id);
  }

  deleteProduct(id: string) {
    this.#backend.deleteProduct(id).subscribe({
      next: () => {
        this.products.update((products) => products.filter((p) => p.id !== id));
      },
    });
  }

  updateAllPrices() {
    this.updatingPrices.set(true);

    this.#backend.updateWishlistPrices().subscribe({
      next: (result) => {
        this.loadProducts();
        this.updatingPrices.set(false);
        console.log(`Updated: ${result.updated}, Skipped: ${result.skipped}`);
      },
      error: () => this.updatingPrices.set(false),
    });
  }

  loadProducts() {
    const status = this.#route.snapshot.data['status'];
    const call =
      status === 'owned' ? this.#backend.getOwnedProducts() : this.#backend.getWishlistProducts();

    call.subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Products could not be loaded!');
        this.loading.set(false);
      },
    });
  }

  ngOnInit() {
    this.loadProducts();
  }
}
