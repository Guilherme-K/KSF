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

  // Calculate order totals (FR16)
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

    const existingIndex = draftItems.findIndex((d) => d.itemId === item.id);
    if (existingIndex >= 0) {
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
      setErrorMsg('Por favor insira o nome do cliente (FR09: ex. "Fishing Store").');
      return;
    }

    if (draftItems.length === 0) {
      setErrorMsg('Adicione pelo menos um item ao pedido (FR10).');
      return;
    }

    const orderDate = new Date();
    const dateCode = `${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}`;
    const randomHex = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ORD-${dateCode}-${randomHex}`;

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

    onUpdateDraftItems([]);
    onUpdateCustomerName('');
    setOrderNotes('');
  };

  // If order was just submitted, show success card
  if (lastCreatedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8 text-center animate-in zoom-in-95 duration-200 pb-20 md:pb-8">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            lastCreatedOrder.status === 'Order registered'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {lastCreatedOrder.status === 'Order registered' ? (
            <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
          ) : (
            <Clock className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse" />
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

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          {lastCreatedOrder.status === 'Order registered'
            ? 'Pedido Enviado para o Computador!'
            : 'Pedido Salvo na Fila Offline!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {lastCreatedOrder.status === 'Order registered'
            ? `Pedido #${lastCreatedOrder.orderNumber} para "${lastCreatedOrder.customerName}" foi registrado com sucesso (FR15/FR17).`
            : `Sem conexão com a internet (FR18). Pedido #${lastCreatedOrder.orderNumber} ficará com status "Pending" até a conexão voltar (FR19).`}
        </p>

        {/* Quick Order Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-6 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Cliente:</span>
            <span className="font-bold text-slate-800">{lastCreatedOrder.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Itens:</span>
            <span className="font-semibold text-slate-800">{lastCreatedOrder.items.length} itens</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="text-slate-500">Valor Total:</span>
            <span className="text-base font-bold text-teal-700">
              {formatCurrency(lastCreatedOrder.totalPrice)}
            </span>
          </div>
        </div>

        {/* Action Buttons: PDF Download (FR18) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => generateOrderPDF(lastCreatedOrder)}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF do Pedido (FR18)</span>
          </button>

          <button
            type="button"
            onClick={() => setLastCreatedOrder(null)}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Pedido</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToOrders}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
          >
            <span>Ver Histórico</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Title & Network State Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Criar Pedido de Venda
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Terminal do Vendedor (FR08)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Selecione itens de pesca, aplique descontos compostos e envie para o computador.
          </p>
        </div>

        {/* Network indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 ${
            isOffline
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline: Salvará como "Pending" (FR18)</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online: Registro direto (FR17)</span>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customer Input (FR09) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Nome do Cliente (FR09: ex. "Fishing Store") *
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Digite o nome da loja ou cliente..."
            value={customerName}
            onChange={(e) => onUpdateCustomerName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-base font-semibold border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden min-h-[44px]"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Sugestões:</span>
          {COMMON_CUSTOMERS.map((cust) => (
            <button
              key={cust}
              type="button"
              onClick={() => onUpdateCustomerName(cust)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all min-h-[32px] ${
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
            <span>Adicionar Itens ao Pedido (FR10)</span>
          </label>
          <span className="text-xs text-slate-400">{catalogItems.length} no catálogo</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Filtrar por nome, categoria ou código..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-slate-50/50 min-h-[44px]"
            />
          </div>

          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-white min-h-[44px]"
          >
            <option value="">-- Escolha um item do catálogo --</option>
            {availableItems.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} [{it.category}] • {formatCurrency(it.price)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAddItemToOrder()}
            disabled={!selectedItemId}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Quick Item List if searching */}
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
                  <span className="text-slate-500 ml-1.5">[{item.category}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-700">{formatCurrency(item.price)}</span>
                  <button
                    type="button"
                    className="px-2 py-1 bg-teal-600 text-white rounded text-[10px] font-semibold"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Line Items List (FR10, FR11, FR12, FR13, FR14, FR15) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs sm:text-base flex items-center gap-2">
            <span>Itens do Pedido</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              {draftItems.length}
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Preço Unitário (FR11) • Código (FR12) • Desconto Composto (FR13/14) • Total (FR15)
          </span>
        </div>

        {draftItems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-xs sm:text-sm text-slate-600">Pedido vazio</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha itens de pesca acima ou no Catálogo para iniciar o pedido.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {draftItems.map((orderItem, idx) => (
              <div key={orderItem.itemId + idx} className="p-3.5 sm:p-5 space-y-3 hover:bg-slate-50/40">
                {/* Header row: Item name, quantity stepper, price */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{orderItem.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                        {orderItem.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> Cód (FR12):
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded select-all">
                        {orderItem.barcode}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper (FR10) & Totals */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Stepper with comfortable touch targets */}
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(idx, orderItem.quantity - 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-sm font-bold min-h-[38px] min-w-[38px] flex items-center justify-center"
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
                        className="w-10 text-center text-xs sm:text-sm font-bold text-slate-800 border-none outline-hidden p-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(idx, orderItem.quantity + 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-sm font-bold min-h-[38px] min-w-[38px] flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Unit Price (FR11) */}
                    <div className="text-right">
                      <span className="text-[9px] uppercase text-slate-400 block">Unitário (FR11)</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        {formatCurrency(orderItem.unitPrice)}
                      </span>
                    </div>

                    {/* Final Item Total (FR15) */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-[9px] uppercase text-slate-400 block">Total (FR15)</span>
                      <span className="text-sm sm:text-base font-bold text-teal-700">
                        {formatCurrency(orderItem.totalPrice)}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Compound Percentage Discounts Editor (FR13 / FR14) */}
                <div className="pt-1">
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
          Observações do Pedido (Opcional)
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Entregar pela manhã; conferir nota no porto..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden"
        />
      </div>

      {/* Desktop Order Totals Summary Card (FR16, FR17) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <span>Subtotal Bruto ({totals.totalItemsCount} unidades):</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totals.subtotal)}</span>
            </div>

            {totals.totalDiscountAmount > 0 && (
              <div className="flex items-center gap-3 text-rose-400">
                <span>Descontos Compostos Economizados:</span>
                <span className="font-bold">-{formatCurrency(totals.totalDiscountAmount)}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <span className="text-sm sm:text-base font-medium text-slate-300">Total do Pedido (FR16):</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">
                {formatCurrency(totals.totalPrice)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendOrder}
            disabled={draftItems.length === 0}
            className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 disabled:opacity-40 min-h-[48px] ${
              isOffline
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {isOffline
                ? 'Enviar Pedido (Salvar Offline "Pending" - FR18)'
                : 'Enviar Pedido para o Computador (FR17)'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Floating Dispatch Bar (when cart has items on phones & small tablets) */}
      {draftItems.length > 0 && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div>
              <span className="text-[10px] text-slate-400 block">Total ({totals.totalItemsCount} un)</span>
              <span className="text-base font-extrabold text-teal-400">{formatCurrency(totals.totalPrice)}</span>
            </div>

            <button
              type="button"
              onClick={handleSendOrder}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
                isOffline ? 'bg-amber-500 text-slate-950' : 'bg-teal-500 text-slate-950'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isOffline ? 'Enviar (Offline)' : 'Enviar Pedido (FR17)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
