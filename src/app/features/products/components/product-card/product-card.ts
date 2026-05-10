import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Product } from '../../../../core/models/product.types';

@Component({
  selector: 'app-product-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    CurrencyPipe,
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  edit = output<void>();
  delete = output<void>();

  getPrimaryImage(): string | null {
    const product = this.product();
    const primary = this.product().images?.find((i) => i.isPrimary);
    return primary?.url ?? product.images?.[0]?.url ?? null;
  }

  getStatusClass(): string {
    const classes: Record<string, string> = {
      wishlist: 'product-card--wishlist',
      owned: 'product-card--owned',
      sold: 'product-card--sold',
    };
    return classes[this.product().status] ?? '';
  }
}
