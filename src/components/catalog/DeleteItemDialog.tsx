import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { FishingItem } from '../../types';
import { formatCurrency } from '../../utils/discounts';

interface DeleteItemDialogProps {
  isOpen: boolean;
  item: FishingItem | null;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
}

export const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Delete Item from Catalog</h3>
              <p className="text-xs text-slate-500">Requirement FR05: User can delete an item</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Item Name:</span>
              <span className="font-semibold text-slate-800">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Barcode:</span>
              <span className="font-mono text-slate-800">{item.barcode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Price:</span>
              <span className="font-semibold text-teal-700">{formatCurrency(item.price)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to remove this item from the catalog? This will remove it from the product list across all categories.
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(item.id);
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
