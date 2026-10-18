import React, { useState } from 'react';
import { X, Plus, Barcode, DollarSign, Check, Sparkles } from 'lucide-react';
import { FishingItem } from '../../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddItem: (item: Omit<FishingItem, 'id' | 'createdAt'>) => void;
  onAddCategory: (categoryName: string) => void;
  initialCategory?: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddItem,
  onAddCategory,
  initialCategory = '',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory || categories[0] || 'Rods');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
    setBarcode(`789${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter item name.');
      return;
    }

    let finalCategory = category;
    if (isCreatingNewCategory) {
      if (!newCategoryName.trim()) {
        setError('Please enter a new category name.');
        return;
      }
      finalCategory = newCategoryName.trim();
      onAddCategory(finalCategory);
    }

    if (!finalCategory) {
      setError('Please select or create a category.');
      return;
    }

    if (!barcode.trim()) {
      setError('Every item must have a registered barcode (FR06).');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid price (FR07).');
      return;
    }

    onAddItem({
      name: name.trim(),
      category: finalCategory,
      barcode: barcode.trim(),
      price: numericPrice,
      stock: parseInt(stock, 10) || 0,
      description: description.trim() || undefined,
    });

    setName('');
    setBarcode('');
    setPrice('');
    setDescription('');
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Add Item to Catalog</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Requirements: FR04, FR06 (Barcode) & FR07 (Price)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Carbon Master Rod, Apex Reel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden min-h-[42px]"
            />
          </div>

          {/* Category Selector (FR01, FR04) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
              >
                {isCreatingNewCategory ? '← Choose Existing' : '+ New Category'}
              </button>
            </div>

            {isCreatingNewCategory ? (
              <input
                type="text"
                placeholder="e.g. Artificial Baits, Boats..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-teal-400 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-teal-50/20 min-h-[42px]"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-white min-h-[42px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Barcode & Price Row (FR06 & FR07) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Barcode (FR06) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-teal-600" />
                  <span>Barcode (FR06) *</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" /> Auto Gen
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 7891001002014"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden tracking-wider min-h-[42px]"
              />
            </div>

            {/* Price (FR07) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                <span>Registered Price (FR07) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-semibold text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="89.90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden min-h-[42px]"
                />
              </div>
            </div>
          </div>

          {/* Stock & Optional Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-hidden min-h-[42px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brief Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Specs, material, action..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-hidden min-h-[42px]"
              />
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md flex items-center gap-1.5 transition-colors min-h-[42px] active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save to Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
