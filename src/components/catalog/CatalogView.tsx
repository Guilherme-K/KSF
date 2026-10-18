import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  Barcode,
  Layers,
  ArrowUpDown,
  Tag,
  Check,
} from 'lucide-react';
import { FishingItem } from '../../types';
import { formatCurrency } from '../../utils/discounts';
import { BarcodeVisual } from '../common/BarcodeVisual';
import { AddItemModal } from './AddItemModal';
import { DeleteItemDialog } from './DeleteItemDialog';

interface CatalogViewProps {
  items: FishingItem[];
  categories: string[];
  onAddItem: (item: Omit<FishingItem, 'id' | 'createdAt'>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddCategory: (categoryName: string) => void;
  onQuickAddToOrder?: (item: FishingItem) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  items,
  categories,
  onAddItem,
  onDeleteItem,
  onAddCategory,
  onQuickAddToOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<FishingItem | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // FR02: Categories listed in alphabetical order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [categories]);

  // Filter items by search query and category
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 'ALL') {
      result = result.filter((it) => it.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.barcode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, selectedCategory, searchQuery]);

  // Group items by category and sort items inside each category alphabetically (FR01, FR02, FR03)
  const groupedByCategory = useMemo(() => {
    const groups: { [cat: string]: FishingItem[] } = {};

    // Ensure all sorted categories exist in groups
    for (const cat of sortedCategories) {
      groups[cat] = [];
    }

    // Populate filtered items
    for (const item of filteredItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }

    // FR03: Items inside each category are listed in alphabetical order
    const result: { category: string; items: FishingItem[] }[] = [];
    for (const cat of sortedCategories) {
      const catItems = groups[cat] || [];
      catItems.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      // Only display category if viewing all and it has matching items, or if selected
      if (selectedCategory === 'ALL' ? catItems.length > 0 : selectedCategory === cat) {
        result.push({
          category: cat,
          items: catItems,
        });
      }
    }

    return result;
  }, [sortedCategories, filteredItems, selectedCategory]);

  const handleQuickAdd = (item: FishingItem) => {
    if (onQuickAddToOrder) {
      onQuickAddToOrder(item);
      setRecentlyAddedId(item.id);
      setTimeout(() => setRecentlyAddedId(null), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fishing Equipment Catalog
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {items.length} items registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organized and sorted alphabetically by category and item (FR01, FR02, FR03).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item (FR04)</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Tabs (FR02: Alphabetical Categories) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search catalog by item name, category, or barcode (e.g. 'APA Rod', '789100...')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden bg-slate-50/50 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (FR02: listed in alphabetical order) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({items.length})
          </button>

          {sortedCategories.map((cat) => {
            const count = items.filter((it) => it.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grouped Listings (FR01, FR02, FR03) */}
      {groupedByCategory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">No items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No items match "${searchQuery}". Try a different keyword or clear filters.`
              : 'This category is currently empty. Use the "Add Item" button above to add equipment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByCategory.map((group) => (
            <div
              key={group.category}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Category Header (Alphabetical FR02) */}
              <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                    {group.category}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    ({group.items.length} {group.items.length === 1 ? 'item' : 'items'}, sorted A-Z)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Alphabetical Items (FR03)
                </span>
              </div>

              {/* Items Grid (FR03: Items inside each category are listed in alphabetical order) */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Item Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base tracking-tight">
                          {item.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        {item.stock !== undefined && (
                          <span className="text-[11px] text-slate-400">
                            • Stock: {item.stock} units
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Barcode (FR06) & Price (FR07) Display */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
                      {/* Barcode Widget (FR06) */}
                      <div className="flex flex-col items-start sm:items-center">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5 flex items-center gap-0.5">
                          <Barcode className="w-3 h-3 text-slate-400" /> Barcode (FR06)
                        </span>
                        <BarcodeVisual value={item.barcode} height={26} />
                      </div>

                      {/* Registered Price (FR07) */}
                      <div className="min-w-[90px] text-left sm:text-right">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                          Price (FR07)
                        </span>
                        <span className="text-lg font-bold text-teal-700 tracking-tight">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      {/* Actions: Add to Order & Delete (FR05) */}
                      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                        {onQuickAddToOrder && (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                              recentlyAddedId === item.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                            title="Add item to current order draft"
                          >
                            {recentlyAddedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>+ Order</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete item from category (FR05)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal (FR04) */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={sortedCategories}
        onAddItem={onAddItem}
        onAddCategory={onAddCategory}
      />

      {/* Delete Item Confirmation Dialog (FR05) */}
      <DeleteItemDialog
        isOpen={Boolean(itemToDelete)}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onDeleteItem}
      />
    </div>
  );
};
