export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
} as const;

export const FINANCIAL_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
  VOIDED: 'VOIDED',
} as const;

export const FULFILLMENT_STATUS = {
  UNFULFILLED: 'UNFULFILLED',
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  RESTOCKED: 'RESTOCKED',
  CANCELLED: 'CANCELLED',
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export const DISCOUNT_VALUE_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
} as const;

export const STORE_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
} as const;

export const WEBHOOK_TOPICS = [
  'orders/create',
  'orders/paid',
  'orders/fulfilled',
  'orders/cancelled',
  'products/create',
  'products/update',
  'products/delete',
  'customers/create',
  'inventory/low_stock',
] as const;

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_TIMEZONE = 'UTC';
export const DEFAULT_LOCALE = 'en';
