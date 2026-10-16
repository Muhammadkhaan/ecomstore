export type ProductCategory = 'all' | 'pret' | 'festive' | 'bridal' | 'ready-to-ship' | 'kaftan' | 'velvet';

export interface Product {
  id: string;
  name: string;
  designer: string;
  category: 'pret' | 'festive' | 'bridal' | 'ready-to-ship' | 'kaftan' | 'velvet';
  occasion: string;
  fabric: string;
  priceUSD: number;
  originalPriceUSD?: number;
  image: string;
  secondaryImage: string;
  badge?: string;
  badgeType?: 'success' | 'alert' | 'tag';
  inStock: boolean;
  readyToShip: boolean;
  dispatchDays: number;
  rating: number;
  reviewsCount: number;
  colors: string[];
  sizes: string[];
  description: string;
  embellishments: string[];
  includes: string;
  videoUrl?: string;
}

export interface CustomMeasurements {
  bust: number;
  waist: number;
  hips: number;
  length: number;
  unit: 'inches' | 'cm';
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  customMeasurements?: CustomMeasurements;
  quantity: number;
}

export type CurrencyCode = 'USD' | 'GBP' | 'AED' | 'PKR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
  format: (amount: number) => string;
}

export interface FilterState {
  search: string;
  category: ProductCategory;
  fabric: string;
  readyToShipOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  maxPriceUSD: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingMethod: 'dhl-express' | 'standard';
  paymentMethod: 'card' | 'cod' | 'apple-pay';
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: CurrencyCode;
  trackingNumber: string;
  estimatedDelivery: string;
  placedAt: string;
}
