import React, { useState } from 'react';
import {
  ShoppingCart,
  User,
  Plus,
  Trash2,
  Send,
  Download,
  AlertCircle,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Sparkles,
  Barcode,
  Search,
  Package,
} from 'lucide-react';
import { FishingItem, Order, OrderItem } from '../../types';
import {
  calculateOrderTotals,
  formatCurrency,
  buildOrderItem,
} from '../../utils/discounts';
import { generateOrderPDF } from '../../utils/pdfGenerator';
import { BarcodeVisual } from '../common/BarcodeVisual';
import { CompoundDiscountEditor } from './CompoundDiscountEditor';

interface CreateOrderViewProps {
  catalogItems: FishingItem[];
  isOffline: boolean;
  draftItems: OrderItem[];
  customerName: string;
  onUpdateDraftItems: (items: OrderItem[]) => void;
  onUpdateCustomerName: (name: string) => void;
  onSaveOrder: (order: Order) => void;
  onNavigateToOrders: () => void;
}

const COMMON_CUSTOMERS = [
  'Fishing Store',
  'Ocean Baits & Tackle',
  'Rio & Mar Outfitters',
  'Lagoon Anglers Club',
  'Harbor Pro Shop',
];

export const CreateOrderView: React.FC<CreateOrderViewProps> = ({
  catalogItems,
  isOffline,
  draftItems,
  customerName,
  onUpdateDraftItems,
  onUpdateCustomerName,
  onSaveOrder,
  onNavigateToOrders,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Calculate overall order totals (FR16)
  const totals = calculateOrderTotals(draftItems);

  // Filter items available to add
  const availableItems = catalogItems.filter((it) => {
    if (!itemSearchQuery.trim()) return true;
    const q = itemSearchQuery.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q) ||
      it.barcode.toLowerCase().includes(q)
    );
  });

  const handleAddItemToOrder = (itemToAdd?: FishingItem) => {
    const item = itemToAdd || catalogItems.find((it) => it.id === selectedItemId);
    if (!item) return;

    // Check if already in draft
    const existingIndex = draftItems.findIndex((d) => d.itemId === item.id);
    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...draftItems];
      const current = updated[existingIndex];
      const newQty = current.quantity + 1;
      updated[existingIndex] = buildOrderItem(
        {
          itemId: item.id,
          name: item.name,
          category: item.category,
          barcode: item.barcode,
          price: item.price,
        },
        newQty,
        current.discounts
      );
      onUpdateDraftItems(updated);
    } else {
      // Add new item with qty 1 and no discount initially
      const newItem = buildOrderItem(
        {
          itemId: item.id,
          name: item.name,
          category: item.category,
          barcode: item.barcode,
          price: item.price,
        },
        1,
        []
      );
      onUpdateDraftItems([...draftItems, newItem]);
    }

    setSelectedItemId('');
    setItemSearchQuery('');
    setErrorMsg('');
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...draftItems];
    const current = updated[index];
    updated[index] = buildOrderItem(
      {
        itemId: current.itemId,
        name: current.name,
        category: current.category,
        barcode: current.barcode,
        price: current.unitPrice,
      },
      newQty,
      current.discounts
    );
    onUpdateDraftItems(updated);
  };

  const handleUpdateDiscounts = (index: number, newDiscounts: number[]) => {
    const updated = [...draftItems];
    const current = updated[index];
    updated[index] = buildOrderItem(
      {
        itemId: current.itemId,
        name: current.name,
        category: current.category,
        barcode: current.barcode,
        price: current.unitPrice,
      },
      current.quantity,
      newDiscounts
    );
    onUpdateDraftItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = draftItems.filter((_, idx) => idx !== index);
    onUpdateDraftItems(updated);
  };

  const handleSendOrder = () => {
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter customer name (FR09: e.g. "Fishing Store").');
      return;
    }

    if (draftItems.length === 0) {
      setErrorMsg('Please add at least one item to the order (FR10).');
      return;
    }

    const orderDate = new Date();
    const dateCode = `${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}`;
    const randomHex = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ORD-${dateCode}-${randomHex}`;

    // Requirements FR17, FR18, FR19:
    // "If there is no internet when the order is sent, the order stays with the status 'Pending'."
    // "When internet is back, pending order changes to 'Order registered'."
    const initialStatus = isOffline ? 'Pending' : 'Order registered';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      items: draftItems,
      subtotal: totals.subtotal,
      totalDiscountAmount: totals.totalDiscountAmount,
      totalPrice: totals.totalPrice,
      status: initialStatus,
      createdAt: orderDate.toISOString(),
      registeredAt: initialStatus === 'Order registered' ? orderDate.toISOString() : undefined,
      createdBy: 'seller',
      notes: orderNotes.trim() || undefined,
    };

    onSaveOrder(newOrder);
    setLastCreatedOrder(newOrder);

    // Clear draft
    onUpdateDraftItems([]);
    onUpdateCustomerName('');
    setOrderNotes('');
  };

  // If order was just submitted, show success state with instant PDF download
  if (lastCreatedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            lastCreatedOrder.status === 'Order registered'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {lastCreatedOrder.status === 'Order registered' ? (
            <CheckCircle2 className="w-9 h-9" />
          ) : (
            <Clock className="w-9 h-9 animate-pulse" />
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100">
          Status:{' '}
          <span
            className={
              lastCreatedOrder.status === 'Order registered'
                ? 'text-emerald-700'
                : 'text-amber-700'
            }
          >
            {lastCreatedOrder.status}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {lastCreatedOrder.status === 'Order registered'
            ? 'Order Sent to Computer!'
            : 'Order Stored in Offline Queue!'}
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {lastCreatedOrder.status === 'Order registered'
            ? `Order #${lastCreatedOrder.orderNumber} for "${lastCreatedOrder.customerName}" has been successfully registered on the computer terminal (FR15/FR17).`
            : `Internet is currently unavailable (FR18). Order #${lastCreatedOrder.orderNumber} will stay as "Pending" until the connection is restored, then automatically register (FR19).`}
        </p>

        {/* Quick Order Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-6 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-800">{lastCreatedOrder.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Items:</span>
            <span className="font-semibold text-slate-800">{lastCreatedOrder.items.length} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Net Total:</span>
            <span className="text-base font-bold text-teal-700">
              {formatCurrency(lastCreatedOrder.totalPrice)}
            </span>
          </div>
        </div>

        {/* Action Buttons: PDF Download (FR18) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => generateOrderPDF(lastCreatedOrder)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF (FR18)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLastCreatedOrder(null);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Another Order</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToOrders}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            <span>View All Orders</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Network State Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create Commercial Order
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Seller Terminal (FR08)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick fishing equipment, apply compound percentage discounts, and dispatch to computer.
          </p>
        </div>

        {/* Network indicator */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
            isOffline
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-600" />
              <span>Offline: Order will save as "Pending" (FR18)</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Online: Order will register directly (FR17)</span>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Header / Customer Input (FR09) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Customer Name (FR09: e.g. "Fishing Store") *
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            required
            placeholder="Type customer or store name (e.g. Fishing Store, Ocean Baits)..."
            value={customerName}
            onChange={(e) => onUpdateCustomerName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base font-semibold border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
          {COMMON_CUSTOMERS.map((cust) => (
            <button
              key={cust}
              type="button"
              onClick={() => onUpdateCustomerName(cust)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                customerName === cust
                  ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {cust}
            </button>
          ))}
        </div>
      </div>

      {/* Item Picker & Search Section (FR10) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-teal-600" />
            <span>Add Fishing Items to Order (FR10)</span>
          </label>
          <span className="text-xs text-slate-400">{catalogItems.length} items in catalog</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter catalog by name, category, or barcode..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-white"
          >
            <option value="">-- Choose item from catalog --</option>
            {availableItems.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} [{it.category}] • {formatCurrency(it.price)} • {it.barcode}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAddItemToOrder()}
            disabled={!selectedItemId}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Quick Item Chips if searching */}
        {itemSearchQuery && availableItems.length > 0 && (
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
            {availableItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 flex items-center justify-between hover:bg-teal-50/40 text-xs cursor-pointer transition-colors"
                onClick={() => handleAddItemToOrder(item)}
              >
                <div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="text-slate-500 ml-2">[{item.category}]</span>
                  <span className="font-mono text-slate-400 ml-2">{item.barcode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-teal-700">{formatCurrency(item.price)}</span>
                  <button
                    type="button"
                    className="px-2 py-0.5 bg-teal-600 text-white rounded text-[11px] font-semibold hover:bg-teal-700"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Items Table (FR10, FR11, FR12, FR13, FR14, FR15) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <span>Order Line Items</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              {draftItems.length} {draftItems.length === 1 ? 'item' : 'items'}
            </span>
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Unit Price (FR11) • Barcode (FR12) • Compound Discounts (FR13/14) • Total (FR15)
          </span>
        </div>

        {draftItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-sm text-slate-600">Order is currently empty</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Select fishing items above or browse the catalog to add items with quantity.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {draftItems.map((orderItem, idx) => (
              <div key={orderItem.itemId + idx} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/40">
                {/* Row 1: Item Info, Barcode (FR12), Unit Price (FR11), Quantity (FR10), Item Total (FR15) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Item name and barcode */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{orderItem.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                        {orderItem.category}
                      </span>
                    </div>

                    {/* Barcode (FR12) */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> Barcode (FR12):
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-700 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded select-all">
                        {orderItem.barcode}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper (FR10) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-start sm:items-center">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
                        Qty (FR10)
                      </span>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, orderItem.quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-sm font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={orderItem.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(idx, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-12 text-center text-sm font-bold text-slate-800 border-none outline-hidden p-0"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, orderItem.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Unit Price (FR11) */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                        Unit Price (FR11)
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(orderItem.unitPrice)}
                      </span>
                    </div>

                    {/* Final Item Total (FR15) */}
                    <div className="text-right min-w-[95px]">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                        Item Total (FR15)
                      </span>
                      <span className="text-base font-bold text-teal-700">
                        {formatCurrency(orderItem.totalPrice)}
                      </span>
                    </div>

                    {/* Delete Item button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                      title="Remove item from order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Compound Percentage Discounts Editor (FR13 / FR14) */}
                <div className="pl-0 sm:pl-7">
                  <CompoundDiscountEditor
                    basePrice={orderItem.unitPrice}
                    discounts={orderItem.discounts}
                    onChange={(newDiscounts) => handleUpdateDiscounts(idx, newDiscounts)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Notes (Optional) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Order Instructions / Delivery Notes (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Leave with dock manager; customer requested immediate Friday delivery..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
        />
      </div>

      {/* Order Totals Summary & Submit Bar (FR14, FR15, FR16, FR17, FR18) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Summary Breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <span>Gross Subtotal ({totals.totalItemsCount} units):</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totals.subtotal)}</span>
            </div>

            {totals.totalDiscountAmount > 0 && (
              <div className="flex items-center gap-3 text-rose-400">
                <span>Total Compound Discounts:</span>
                <span className="font-bold">-{formatCurrency(totals.totalDiscountAmount)}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <span className="text-base font-medium text-slate-300">Order Net Total (FR16):</span>
              <span className="text-3xl font-extrabold text-teal-400 tracking-tight">
                {formatCurrency(totals.totalPrice)}
              </span>
            </div>
          </div>

          {/* Right: Dispatch / Send Button (FR17) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleSendOrder}
              disabled={draftItems.length === 0}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isOffline
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isOffline
                  ? 'Send Order (Save as "Pending" Offline - FR18)'
                  : 'Send Order to Computer (FR17)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
