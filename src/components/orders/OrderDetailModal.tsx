import React from 'react';
import { X, Download, Clock, CheckCircle2, Barcode, User, Calendar, FileText } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/discounts';
import { generateOrderPDF } from '../../utils/pdfGenerator';
import { BarcodeVisual } from '../common/BarcodeVisual';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-teal-400 font-semibold">{order.orderNumber}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  order.status === 'Order registered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {order.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{order.customerName}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateOrderPDF(order)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF (FR18)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date Placed:
              </span>
              <span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span>
            </div>
            {order.registeredAt && (
              <div>
                <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Registered:
                </span>
                <span className="font-semibold text-slate-800">{formatDate(order.registeredAt)}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Customer:
              </span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
          </div>

          {order.notes && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Notes: </span>
              {order.notes}
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-2.5">
              Order Items ({order.items.length})
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-slate-500">
                      <span className="font-mono text-[11px] bg-slate-100 px-1 rounded">
                        Barcode: {item.barcode}
                      </span>
                      <span>Unit: {formatCurrency(item.unitPrice)}</span>
                      <span>Qty: <strong>{item.quantity}</strong></span>
                    </div>

                    {/* Compound Discounts breakdown */}
                    {item.discounts && item.discounts.length > 0 && (
                      <div className="mt-1 flex items-center gap-1.5 text-rose-700 font-semibold text-[11px]">
                        <span>Discounts:</span>
                        {item.discounts.map((d, dIdx) => (
                          <span key={dIdx} className="bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                            -{d}%
                          </span>
                        ))}
                        <span className="text-slate-400">→ Final Unit: {formatCurrency(item.finalUnitPrice)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:shrink-0">
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="font-bold text-sm text-teal-700">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.totalDiscountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Total Discounts Saved:</span>
                <span>-{formatCurrency(order.totalDiscountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Order Total (FR16):</span>
              <span className="text-lg text-teal-700">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Click Download PDF to export full printable invoice (FR18)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
