import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Product } from '../../../../core/models/product.types';

@Component({
  selector: 'app-product-card',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
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
  navigate = output<void>();

  conditionConfig: Record<string, { icon: string; label: string }> = {
    new: { icon: 'new_releases', label: 'Neu' },
    assembled: { icon: 'view_in_ar', label: 'Aufgebaut' },
    lent: { icon: 'swap_horiz', label: 'Verliehen' },
    stored: { icon: 'inventory_2', label: 'Eingepackt' },
  };

  condition = computed(() => {
    const condition = this.product().ownershipData?.condition;
    if (!condition) return null;
    return this.conditionConfig[condition] ?? null;
  });

  primaryImage = computed(() => {
    const product = this.product();
    const primary = product.images?.find((i) => i.isPrimary);
    return primary?.url ?? product.images?.[0]?.url ?? null;
  });

  statusClass = computed(() => {
    const classes: Record<string, string> = {
      wishlist: 'product-card--wishlist',
      owned: 'product-card--owned',
      sold: 'product-card--sold',
    };
    return classes[this.product().status] ?? '';
  });
}
