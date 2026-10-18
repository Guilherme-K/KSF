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

export interface OrderItem {
  itemId: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number; // base price from item registration (FR11)
  quantity: number; // quantity added (FR10)
  totalPrice: number; // quantity * unitPrice (FR13 / FR15)
}

export type OrderStatus = 'Pending' | 'Order registered';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-001"
  customerName: string; // e.g. "Fishing Store" (FR09)
  items: OrderItem[];
  subtotal: number;
  totalPrice: number; // sum of item totals (FR14 / FR16)
  status: OrderStatus;
  createdAt: string; // ISO date string
  registeredAt?: string; // when received by computer (FR17 / FR19)
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
