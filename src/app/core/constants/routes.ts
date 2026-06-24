export const ROUTE_PATHS = {
  PRODUCTS: 'sets',
  WISHLIST: 'wishlist',
  NEW: 'new',
  EDIT: 'edit',
} as const;

export const NAVIGATION = {
  products: () => [ROUTE_PATHS.PRODUCTS],
  wishlist: () => [ROUTE_PATHS.WISHLIST],
  productNew: () => [ROUTE_PATHS.PRODUCTS, ROUTE_PATHS.NEW],
  productDetail: (id: string) => [ROUTE_PATHS.PRODUCTS, id],
  productEdit: (id: string) => [ROUTE_PATHS.PRODUCTS, id, ROUTE_PATHS.EDIT],
} as const;
