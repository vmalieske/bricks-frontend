import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { NAVIGATION } from '../constants/routes';

@Injectable({ providedIn: 'root' })
export class NavigationHandlerService {
  #router = inject(Router);
  #url = toSignal(this.#router.events.pipe(map(() => this.#router.url)), {
    initialValue: this.#router.url,
  });

  isWishlistContext = computed(() => this.#url().startsWith('/wishlist'));

  toProducts() {
    this.#router.navigate(NAVIGATION.products());
  }

  toWishlist() {
    this.#router.navigate(NAVIGATION.wishlist());
  }

  toPriductDetail(id: string) {
    this.#router.navigate(NAVIGATION.productDetail(id));
  }

  toWishlistDetail(id: string) {
    this.#router.navigate(NAVIGATION.wishlistDetail(id));
  }

  toDetailPage(id: string) {
    this.isWishlistContext() ? this.toWishlistDetail(id) : this.toPriductDetail(id);
  }

  toEdit(id: string) {
    this.isWishlistContext()
      ? this.#router.navigate(NAVIGATION.wishlistEdit(id))
      : this.#router.navigate(NAVIGATION.productEdit(id));
  }

  toNewProductForm() {
    this.#router.navigate(NAVIGATION.productNew());
  }

  back() {
    this.isWishlistContext() ? this.toWishlist() : this.toProducts();
  }
}
