import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { form, FormField, FormRoot, required, min } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackendService } from '../../../core/services/backend.service';
import {
  BRICK_FORMATS,
  BrickFormat,
  Condition,
  CONDITIONS,
  PRODUCT_STATUS,
  ProductStatus,
} from '../../../core/models/product.types';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-form',
  imports: [FormField, FormRoot, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-form.scss',
})
export class ProductFormComponent implements OnInit {
  #backend = inject(BackendService);
  #navigate = inject(NavigationHandlerService);
  #route = inject(ActivatedRoute);

  brickFormats = BRICK_FORMATS;
  conditions = CONDITIONS;
  productStatus = PRODUCT_STATUS;

  loading = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  formModel = signal({
    title: '',
    brickFormat: '' as BrickFormat | '',
    brickCount: 0,
    status: 'owned' as ProductStatus,
    productNumber: '',
    brand: '',
    shopName: '',
    shopUrl: '',
    condition: '' as Condition | '',
    notes: '',
  });

  productForm = form(
    this.formModel,
    (schema) => {
      required(schema.title, { message: 'Title is required!' });
      required(schema.brickFormat, { message: 'Brick Format ist erforderlich!' });
      required(schema.brickCount, { message: 'Brick Anzahl ist erforderlich!' });
      min(schema.brickCount, 1, { message: 'Mindestens 1 Teil ist erforderlich!' });
      required(schema.status, { message: 'Status ist erforderlich!' });
    },
    {
      submission: {
        action: async () => {
          const value = this.formModel();
          const payload = {
            title: value.title,
            brickFormat: value.brickFormat as BrickFormat,
            brickCount: value.brickCount,
            status: value.status,
            productNumber: value.productNumber || undefined,
            brand: value.brand || undefined,
            shop: value.shopName
              ? { name: value.shopName, productUrl: value.shopUrl || undefined }
              : undefined,
            ownershipData:
              this.isOwned() && value.condition
                ? { condition: value.condition as Condition }
                : undefined,
            notes: value.notes || undefined,
          };

          try {
            if (this.isEditMode()) {
              await firstValueFrom(this.#backend.updateProduct(this.productId()!, payload));
            } else {
              await firstValueFrom(this.#backend.createProduct(payload));
            }
            this.#navigate.back();
            return; // ← explizites return für Erfolg
          } catch (error) {
            console.error('Cannot save product', error);
            return { kind: 'serverError', message: 'Speichern fehlgeschlagen' };
          }
        },
      },
    },
  );

  isOwned = computed(() => this.formModel().status === 'owned');

  loadProduct(id: string) {
    this.loading.set(true);

    this.#backend.getProductById(id).subscribe({
      next: (product) => {
        this.formModel.set({
          title: product.title,
          brickFormat: product.brickFormat,
          brickCount: product.brickCount,
          status: product.status,
          productNumber: product.productNumber ?? '',
          brand: product.brand ?? '',
          shopName: product.shop?.name ?? '',
          shopUrl: product.shop?.productUrl ?? '',
          condition: product.ownershipData?.condition ?? '',
          notes: product.notes ?? '',
        });

        this.loading.set(false);
      },

      error: () => this.loading.set(false),
    });
  }

  navigateBack() {
    this.#navigate.back();
  }

  ngOnInit() {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }
}
