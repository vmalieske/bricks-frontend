import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/products-list/products-list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sets',
    pathMatch: 'full',
  },
  { path: 'sets', component: ProductsListComponent, data: { status: 'owned' } },
  { path: 'wishlist', component: ProductsListComponent, data: { status: 'wishlist' } },
];
