export interface FishingItem {
  id: string;
  name: string;
  category: string;
  barcode: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  createdAt: string;
}

export interface OrderDiscount {
  id: string;
  percentage: number; // e.g. 10 for 10%
  label?: string; // e.g. "Cash Discount", "Bulk Promo"
}

export interface OrderItem {
  itemId: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number; // base price from item registration
  quantity: number;
  discounts: number[]; // e.g. [10, 10] compound discounts
  finalUnitPrice: number; // price after compound discounts
  totalPrice: number; // quantity * finalUnitPrice
}

export type OrderStatus = 'Pending' | 'Order registered';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-001"
  customerName: string; // e.g. "Fishing Store"
  items: OrderItem[];
  subtotal: number; // sum before discounts
  totalDiscountAmount: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  registeredAt?: string; // when it reached computer / registered
  createdBy: 'seller' | 'manager';
  notes?: string;
}

export type UserRole = 'seller' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  deviceLabel: string;
}

export interface ReportDateFilter {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  presetLabel?: string;
}

export interface SalesReportSummary {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalSalesCount: number;
  totalRevenue: number;
  registeredCount: number;
  pendingCount: number;
  averageOrderValue: number;
  customerBreakdown: { customerName: string; orderCount: number; totalSpent: number }[];
  topItems: { name: string; category: string; barcode: string; quantitySold: number; totalRevenue: number }[];
  categoryBreakdown: { category: string; quantitySold: number; totalRevenue: number }[];
  orders: Order[];
}
