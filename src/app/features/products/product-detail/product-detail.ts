import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackendService } from '../../../core/services/backend.service';
import { Product } from '../../../core/models/product.types';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  #backend = inject(BackendService);
  #navigate = inject(NavigationHandlerService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  activeImageIndex = signal(0);

  getActiveImage(): string | null {
    const images = this.product()?.images;
    if (!images?.length) return null;
    return images[this.activeImageIndex()]?.url ?? images[0].url;
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      wishlist: 'Wunschliste',
      owned: 'Besitz',
      sold: 'Verkauft',
    };

    return labels[this.product()?.status ?? ''] ?? '';
  }

  getStatusColor(): string {
    const colors: Record<string, string> = {
      wishlist: 'accent',
      owned: 'primary',
      sold: 'warn',
    };
    return colors[this.product()?.status ?? ''] ?? 'primary';
  }

  setActiveImage(index: number) {
    this.activeImageIndex.set(index);
  }

  deleteProduct() {
    const id = this.product()?.id;
    if (!id) return;
    this.#backend.deleteProduct(id).subscribe({
      next: () => this.#navigate.back(),
    });
  }

  navigateToEdit() {
    const id = this.product()?.id;
    if (!id) return;
    this.#navigate.toEdit(id);
  }

  navigateToHome() {
    this.#navigate.toProducts();
  }

  navigateBack() {
    this.#navigate.back();
  }

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (!id) {
      this.#navigate.toProducts();
      return;
    }

    this.#backend.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Product could not be loaded');
        this.loading.set(false);
      },
    });
  }
}
