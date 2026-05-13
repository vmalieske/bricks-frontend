import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/products-list/products-list';
import { ProductFormComponent } from './features/products/product-form/product-form';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sets',
    pathMatch: 'full',
  },
  { path: 'sets', component: ProductsListComponent, data: { status: 'owned' } },
  { path: 'wishlist', component: ProductsListComponent, data: { status: 'wishlist' } },
  { path: 'sets/new', component: ProductFormComponent },
  { path: 'sets/:id/edit', component: ProductFormComponent },
];
