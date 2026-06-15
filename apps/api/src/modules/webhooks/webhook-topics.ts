export const WEBHOOK_TOPICS = [
  'orders/created',
  'orders/updated',
  'orders/cancelled',
  'orders/fulfilled',
  'products/created',
  'products/updated',
  'products/deleted',
  'customers/created',
  'customers/updated',
  'payments/created',
  'inventory/updated',
] as const;

export type WebhookTopic = typeof WEBHOOK_TOPICS[number];
