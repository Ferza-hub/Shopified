export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  storeId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  storeId?: string;
  role?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  provinceCode?: string;
  country: string;
  countryCode: string;
  zip?: string;
  phone?: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ShippingRateQuote {
  id: string;
  name: string;
  price: number;
  estimatedDays?: number;
  carrier?: string;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
}

export type SortOrder = 'asc' | 'desc';
