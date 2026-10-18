import { OrderItem } from '../types';

/**
 * Computes an order item without discounts: quantity * unitPrice
 */
export function buildOrderItem(
  item: { itemId: string; name: string; category: string; barcode: string; price: number },
  quantity: number
): OrderItem {
  const safeQty = Math.max(1, quantity);
  const totalPrice = Math.round(safeQty * item.price * 100) / 100;

  return {
    itemId: item.itemId,
    name: item.name,
    category: item.category,
    barcode: item.barcode,
    unitPrice: item.price,
    quantity: safeQty,
    totalPrice,
  };
}

/**
 * Computes overall order totals: subtotal, totalPrice, and item count
 */
export function calculateOrderTotals(items: OrderItem[]): {
  subtotal: number;
  totalPrice: number;
  totalItemsCount: number;
} {
  let subtotal = 0;
  let totalItemsCount = 0;

  for (const it of items) {
    subtotal += it.totalPrice;
    totalItemsCount += it.quantity;
  }

  subtotal = Math.round(subtotal * 100) / 100;

  return {
    subtotal,
    totalPrice: subtotal,
    totalItemsCount,
  };
}

/**
 * Format currency in US Dollars (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for user display (e.g. Oct 18, 2026, 03:45 PM)
 */
export function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoDate;
  }
}

/**
 * Format short date (MM/DD/YYYY)
 */
export function formatShortDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('T')[0].split('-');
    if (y && m && d) {
      return `${m}/${d}/${y}`;
    }
    const dt = new Date(dateStr);
    return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}/${dt.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
