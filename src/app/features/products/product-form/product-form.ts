import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { form, FormField, FormRoot, required, min } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { BackendService } from '../../../core/services/backend.service';
import {
  BRICK_FORMATS,
  BrickFormat,
  Condition,
  CONDITIONS,
  PRODUCT_STATUS,
  ProductStatus,
  ProductImage,
} from '../../../core/models/product.types';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  imports: [
    FormField,
    FormRoot,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-form.scss',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  #backend = inject(BackendService);
  #navigate = inject(NavigationHandlerService);
  #route = inject(ActivatedRoute);

  #sessionUploadedUrls = new Set<string>();

  brickFormats = BRICK_FORMATS;
  conditions = CONDITIONS;
  productStatus = PRODUCT_STATUS;
  apiUrl = environment.apiUrl;

  loading = signal(false);
  scraping = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  scrapeUrl = signal('');

  activeImageTab = signal<'link' | 'upload'>('link');
  linkImageInput = signal('');
  uploadingImages = signal(false);

  formModel = signal({
    title: '',
    brickFormat: '' as BrickFormat | '',
    brickCount: 0,
    status: 'owned' as ProductStatus,
    productNumber: '',
    brand: '',
    shopName: '',
    shopUrl: '',
    images: [] as ProductImage[],
    condition: '' as Condition | '',
    notes: '',
  });

  productForm = form(
    this.formModel,
    (schema) => {
      required(schema.title, { message: 'Title is required!' });
      required(schema.brickFormat, { message: 'Brick Format is required!' });
      required(schema.brickCount, { message: 'Brick count is required!' });
      min(schema.brickCount, 1, { message: 'At least 1 part is required!' });
      required(schema.status, { message: 'Status is required!' });
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
            images: value.images.length > 0 ? value.images : undefined,
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
            this.#sessionUploadedUrls.clear();
            this.#navigate.back();
            return;
          } catch (error) {
            console.error('Cannot save product', error);
            return { kind: 'serverError', message: 'Saving failed' };
          }
        },
      },
    },
  );

  isOwned = computed(() => this.formModel().status === 'owned');

  imageSrc(image: ProductImage): string {
    return image.type === 'local' ? `${this.apiUrl}${image.url}` : image.url;
  }

  onImageTabChange(index: number) {
    const tab: 'link' | 'upload' = index === 0 ? 'link' : 'upload';
    if (tab !== this.activeImageTab() && this.formModel().images.length > 0) {
      this.formModel.update((model) => ({ ...model, images: [] }));
    }
    this.activeImageTab.set(tab);
  }

  addLinkImage() {
    const url = this.linkImageInput().trim();
    if (!url) return;

    this.formModel.update((model) => ({
      ...model,
      images: [...model.images, { type: 'external', url, isPrimary: model.images.length === 0 }],
    }));
    this.linkImageInput.set('');
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.uploadingImages.set(true);

    this.#backend.uploadImages(Array.from(files)).subscribe({
      next: (result) => {
        result.images.forEach((img) => this.#sessionUploadedUrls.add(img.url));

        this.formModel.update((model) => ({
          ...model,
          images: [
            ...model.images,
            ...result.images.map((img, i) => ({
              ...img,
              isPrimary: model.images.length === 0 && i === 0,
            })),
          ],
        }));
        this.uploadingImages.set(false);
        input.value = '';
      },
      error: () => {
        this.uploadingImages.set(false);
        input.value = '';
      },
    });
  }

  removeImage(index: number) {
    const image = this.formModel().images[index];

    if (image.type === 'local') {
      this.#backend.deleteImage(image.url).subscribe();
      this.#sessionUploadedUrls.delete(image.url);
    }

    this.formModel.update((model) => {
      const images = model.images.filter((_, i) => i !== index);
      if (images.length > 0 && !images.some((img) => img.isPrimary)) {
        images[0] = { ...images[0], isPrimary: true };
      }
      return { ...model, images };
    });
  }

  setPrimaryImage(index: number) {
    this.formModel.update((model) => ({
      ...model,
      images: model.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  }

  scrapeFromUrl() {
    const url = this.scrapeUrl();
    if (!url) return;
    this.scraping.set(true);

    this.#backend.scrapeProduct(url).subscribe({
      next: (result) => {
        this.formModel.update((model) => ({
          ...model,
          title: result.title ?? model.title,
          brand: result.brand ?? model.brand,
          productNumber: result.productNumber ?? model.productNumber,
          brickCount: result.brickCount ?? model.brickCount,
          brickFormat: (result.brickFormat as typeof model.brickFormat) ?? model.brickFormat,
          shopName: 'BlueBrixx',
          shopUrl: result.shopUrl,
          images:
            result.imageUrls.length > 0
              ? result.imageUrls.map((url, i) => ({
                  type: 'external' as const,
                  url,
                  isPrimary: i === 0,
                }))
              : model.images,
        }));
        this.activeImageTab.set('link');
        this.scraping.set(false);
      },
      error: () => this.scraping.set(false),
    });
  }

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
          images: product.images ?? [],
          condition: product.ownershipData?.condition ?? '',
          notes: product.notes ?? '',
        });
        this.activeImageTab.set(product.images?.[0]?.type === 'local' ? 'upload' : 'link');
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
    } else {
      const status = this.#route.snapshot.data['status'];

      if (status) {
        this.formModel.update((model) => ({
          ...model,
          status: status,
        }));
      }
    }
  }

  ngOnDestroy() {
    this.#sessionUploadedUrls.forEach((url) => {
      this.#backend.deleteImage(url).subscribe();
    });
  }
}
