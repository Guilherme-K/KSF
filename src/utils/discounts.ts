import { OrderItem } from '../types';

export interface CompoundStep {
  step: number;
  fromPrice: number;
  percentage: number;
  discountAmount: number;
  toPrice: number;
}

/**
 * Calculates compound discounts step-by-step
 * E.g., basePrice 100, discounts [10, 10]:
 * Step 1: 100 -> 10% = 90 (saving 10)
 * Step 2: 90 -> 10% = 81 (saving 9)
 * Final unit price = 81
 */
export function calculateCompoundPrice(
  basePrice: number,
  discounts: number[] = []
): {
  steps: CompoundStep[];
  finalUnitPrice: number;
  totalDiscountAmountPerUnit: number;
  effectivePercentage: number;
} {
  let currentPrice = Math.max(0, basePrice);
  const steps: CompoundStep[] = [];

  for (let i = 0; i < discounts.length; i++) {
    const percent = Math.max(0, Math.min(100, discounts[i]));
    const discountAmount = currentPrice * (percent / 100);
    const toPrice = Math.max(0, currentPrice - discountAmount);

    steps.push({
      step: i + 1,
      fromPrice: currentPrice,
      percentage: percent,
      discountAmount,
      toPrice,
    });

    currentPrice = toPrice;
  }

  // Rounded to 2 decimal places for financial accuracy
  const finalUnitPrice = Math.round(currentPrice * 100) / 100;
  const totalDiscountAmountPerUnit = Math.max(0, Math.round((basePrice - finalUnitPrice) * 100) / 100);
  const effectivePercentage =
    basePrice > 0 ? Math.round(((basePrice - finalUnitPrice) / basePrice) * 10000) / 100 : 0;

  return {
    steps,
    finalUnitPrice,
    totalDiscountAmountPerUnit,
    effectivePercentage,
  };
}

/**
 * Computes the item's total price based on quantity and compound discounts
 */
export function buildOrderItem(
  item: { itemId: string; name: string; category: string; barcode: string; price: number },
  quantity: number,
  discounts: number[] = []
): OrderItem {
  const { finalUnitPrice } = calculateCompoundPrice(item.price, discounts);
  const totalPrice = Math.round(quantity * finalUnitPrice * 100) / 100;

  return {
    itemId: item.itemId,
    name: item.name,
    category: item.category,
    barcode: item.barcode,
    unitPrice: item.price,
    quantity,
    discounts,
    finalUnitPrice,
    totalPrice,
  };
}

/**
 * Computes overall order totals: gross subtotal, total discount savings, net total
 */
export function calculateOrderTotals(items: OrderItem[]): {
  subtotal: number;
  totalDiscountAmount: number;
  totalPrice: number;
  totalItemsCount: number;
} {
  let subtotal = 0;
  let totalPrice = 0;
  let totalItemsCount = 0;

  for (const it of items) {
    const grossItemTotal = it.unitPrice * it.quantity;
    subtotal += grossItemTotal;
    totalPrice += it.totalPrice;
    totalItemsCount += it.quantity;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  totalPrice = Math.round(totalPrice * 100) / 100;
  const totalDiscountAmount = Math.max(0, Math.round((subtotal - totalPrice) * 100) / 100);

  return {
    subtotal,
    totalDiscountAmount,
    totalPrice,
    totalItemsCount,
  };
}

/**
 * Format currency with 2 decimals
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
 * Format date for user display
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
    // If YYYY-MM-DD
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
