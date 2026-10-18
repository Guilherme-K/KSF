import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Download,
  Eye,
  Search,
  RefreshCw,
  ShoppingBag,
  Plus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/discounts';
import { generateOrderPDF } from '../../utils/pdfGenerator';
import { OrderDetailModal } from './OrderDetailModal';

interface OrdersListViewProps {
  orders: Order[];
  isOffline: boolean;
  onSyncPending: () => void;
  onCreateNewOrder: () => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  isOffline,
  onSyncPending,
  onCreateNewOrder,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q) || it.barcode.includes(q))
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const registeredCount = orders.filter((o) => o.status === 'Order registered').length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Orders History & Dispatch
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {orders.length} total orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking registered orders, offline pending queue, and downloadable PDFs (FR16-FR19).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOffline && pendingCount > 0 && (
            <button
              type="button"
              onClick={onSyncPending}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync {pendingCount} Pending (FR19)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNewOrder}
            className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Order (FR08)</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner when Pending Orders Exist */}
      {pendingCount > 0 && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm ${
            isOffline
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : 'bg-teal-50/90 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isOffline ? (
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Wifi className="w-5 h-5 text-teal-600 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {pendingCount} order{pendingCount === 1 ? '' : 's'} waiting with status "Pending" (FR16/FR18)
              </p>
              <p className="text-[11px] sm:text-xs opacity-80">
                {isOffline
                  ? 'Currently offline. When connection returns, pending orders will be automatically sent to computer (FR19).'
                  : 'Internet is back online! Click Sync Now or toggle network to finalize computer registration.'}
              </p>
            </div>
          </div>

          {!isOffline && (
            <button
              type="button"
              onClick={onSyncPending}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shrink-0 self-end sm:self-center"
            >
              Sync Now
            </button>
          )}
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search orders by customer name, order #, or item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-slate-50/50 focus:bg-white min-h-[44px]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Order registered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'Order registered'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Registered ({registeredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see other orders.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {filteredOrders.map((order) => {
            const isRegistered = order.status === 'Order registered';
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-500">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        isRegistered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isRegistered ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                      )}
                      <span>{order.status}</span>
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400">• {formatDate(order.createdAt)}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {order.customerName}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}:
                    </span>
                    <span className="text-slate-700 font-medium">
                      {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Right: Price & Touch Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">
                      Order Total (FR14 / FR16)
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-teal-700 tracking-tight">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
                      title="View order details"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateOrderPDF(order)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
                      title="Download PDF with all order information (FR18)"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF (FR18)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
