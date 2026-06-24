import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/constants/routes';
import { ProductsListComponent } from './features/products/products-list/products-list';
import { ProductFormComponent } from './features/products/product-form/product-form';

export const routes: Routes = [
  {
    path: '',
    redirectTo: ROUTE_PATHS.PRODUCTS,
    pathMatch: 'full',
  },
  { path: ROUTE_PATHS.PRODUCTS, component: ProductsListComponent, data: { status: 'owned' } },
  { path: ROUTE_PATHS.WISHLIST, component: ProductsListComponent, data: { status: 'wishlist' } },
  { path: `${ROUTE_PATHS.PRODUCTS}/${ROUTE_PATHS.NEW}`, component: ProductFormComponent },
  // { path: `${ROUTE_PATHS.PRODUCTS}/:id`, component: ProductDetailComponent },
  { path: `${ROUTE_PATHS.PRODUCTS}/:id/${ROUTE_PATHS.EDIT}`, component: ProductFormComponent },
];
