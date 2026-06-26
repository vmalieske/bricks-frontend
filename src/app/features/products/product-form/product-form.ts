import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BackendService } from '../../../core/services/backend.service';
import { BRICK_FORMATS, CONDITIONS, PRODUCT_STATUS } from '../../../core/models/product.types';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormComponent implements OnInit {
  #backend = inject(BackendService);
  #formbuilder = inject(FormBuilder);
  #navigate = inject(NavigationHandlerService);
  #route = inject(ActivatedRoute);

  brickFormats = BRICK_FORMATS;
  conditions = CONDITIONS;
  productStatus = PRODUCT_STATUS;

  loading = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  form = this.#formbuilder.group({
    title: ['', Validators.required],
    brickFormat: ['', Validators.required],
    brickCount: [null as number | null, [Validators.required, Validators.min(1)]],
    status: ['wishlist', Validators.required],
    productNumber: [''],
    brand: [''],
    shopName: [''],
    shopUrl: [''],
    condition: [''],
    notes: [''],
  });

  get isOwned() {
    return this.form.get('status')?.value === 'owned';
  }

  loadProduct(id: string) {
    this.loading.set(true);

    this.#backend.getProductById(id).subscribe({
      next: (product) => {
        this.form.patchValue({
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

  submit() {
    if (this.form.invalid) return;

    const value = this.form.value;

    const payload = {
      title: value.title!,
      brickFormat: value.brickFormat! as any,
      brickCount: value.brickCount!,
      status: value.status! as any,
      productNumber: value.productNumber || undefined,
      brand: value.brand || undefined,
      shop: value.shopName
        ? { name: value.shopName, productUrl: value.shopUrl || undefined }
        : undefined,
      ownershipData:
        this.isOwned && value.condition ? { condition: value.condition as any } : undefined,
      notes: value.notes || undefined,
    };

    this.loading.set(true);

    if (this.isEditMode()) {
      this.#backend.updateProduct(this.productId()!, payload).subscribe({
        next: () => this.navigateBack(),
        error: (error) => {
          console.error('Cannot update product', error);
          this.loading.set(false);
        },
      });
    } else {
      this.#backend.createProduct(payload).subscribe({
        next: () => this.navigateBack(),
        error: (error) => {
          console.error('Cannot create product', error);
          this.loading.set(false);
        },
      });
    }
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
