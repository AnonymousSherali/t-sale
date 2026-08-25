/**
 * Single source of truth for order statuses. The model enum, the API validation
 * and the UI dropdown all read from here so they can never drift apart.
 */
export const ORDER_STATUSES = [
  'Kutilmoqda',
  'Tasdiqlandi',
  'Yetkazilmoqda',
  'Yetkazildi',
  'Bekor qilindi',
];

export const DEFAULT_STATUS = 'Kutilmoqda';
export const CANCELLED_STATUS = 'Bekor qilindi';

/** Tailwind classes for the status badge in the orders list. */
export const STATUS_COLORS = {
  Kutilmoqda: 'bg-yellow-100 text-yellow-800',
  Tasdiqlandi: 'bg-blue-100 text-blue-800',
  Yetkazilmoqda: 'bg-purple-100 text-purple-800',
  Yetkazildi: 'bg-green-100 text-green-800',
  'Bekor qilindi': 'bg-red-100 text-red-800',
};

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}
