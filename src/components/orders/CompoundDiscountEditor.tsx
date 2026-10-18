import React, { useState } from 'react';
import { Plus, X, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { calculateCompoundPrice, formatCurrency } from '../../utils/discounts';

interface CompoundDiscountEditorProps {
  basePrice: number;
  discounts: number[];
  onChange: (newDiscounts: number[]) => void;
  compact?: boolean;
}

export const CompoundDiscountEditor: React.FC<CompoundDiscountEditorProps> = ({
  basePrice,
  discounts,
  onChange,
  compact = false,
}) => {
  const [customPercent, setCustomPercent] = useState<string>('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const { steps, finalUnitPrice, totalDiscountAmountPerUnit, effectivePercentage } =
    calculateCompoundPrice(basePrice, discounts);

  const handleAddDiscount = (val: number) => {
    if (val > 0 && val <= 99) {
      onChange([...discounts, val]);
      setCustomPercent('');
      setIsAddingCustom(false);
    }
  };

  const handleRemoveDiscount = (indexToRemove: number) => {
    const updated = discounts.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {discounts.map((d, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
            >
              -{d}%
              <button
                type="button"
                onClick={() => handleRemoveDiscount(idx)}
                className="hover:text-rose-900 focus:outline-hidden"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Quick Add pills */}
          <div className="inline-flex items-center gap-1">
            {[5, 10].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleAddDiscount(pct)}
                className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                +{pct}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Custom
            </button>
          </div>
        </div>

        {isAddingCustom && (
          <div className="flex items-center gap-1 pt-1">
            <input
              type="number"
              min="1"
              max="99"
              placeholder="e.g. 8"
              value={customPercent}
              onChange={(e) => setCustomPercent(e.target.value)}
              className="w-16 px-2 py-0.5 text-xs border border-teal-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
            <span className="text-xs text-slate-500">%</span>
            <button
              type="button"
              onClick={() => handleAddDiscount(Number(customPercent))}
              className="px-2 py-0.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 font-medium"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Percent className="w-4 h-4 text-teal-600" />
          <span>Compound Percentage Discounts (FR13 / FR14)</span>
        </div>
        {discounts.length > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
            Total Saved: -{effectivePercentage}% ({formatCurrency(totalDiscountAmountPerUnit)}/unit)
          </span>
        )}
      </div>

      {/* Applied Discount Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {discounts.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No discounts applied yet</span>
        ) : (
          discounts.map((pct, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
            >
              <span>Step {idx + 1}: -{pct}%</span>
              <button
                type="button"
                onClick={() => handleRemoveDiscount(idx)}
                className="hover:text-rose-900 hover:bg-rose-100 rounded-full p-0.5"
                title="Remove discount"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add discounts controls */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
        <span className="text-xs text-slate-500 font-medium mr-1">Add discount:</span>
        {[5, 10, 15, 20].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleAddDiscount(preset)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/50 transition-colors shadow-2xs"
          >
            +{preset}%
          </button>
        ))}

        <div className="inline-flex items-center gap-1 ml-auto">
          <input
            type="number"
            min="1"
            max="99"
            placeholder="Custom %"
            value={customPercent}
            onChange={(e) => setCustomPercent(e.target.value)}
            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden bg-white"
          />
          <button
            type="button"
            onClick={() => handleAddDiscount(Number(customPercent))}
            disabled={!customPercent || Number(customPercent) <= 0}
            className="px-2.5 py-1 text-xs font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Step-by-Step Compound Math Preview (FR14 Visualization) */}
      {steps.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-200 bg-white/70 rounded p-2 text-xs">
          <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Compound Calculation Breakdown (FR14):</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-600">
            <div className="flex items-center justify-between text-slate-500">
              <span>Base unit price:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(basePrice)}</span>
            </div>
            {steps.map((st) => (
              <div key={st.step} className="flex items-center justify-between text-rose-700 pl-2">
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  Step {st.step}: {formatCurrency(st.fromPrice)} − {st.percentage}%
                </span>
                <span>= {formatCurrency(st.toPrice)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-300 text-slate-900 font-bold">
              <span>Final discounted unit price:</span>
              <span className="text-teal-700">{formatCurrency(finalUnitPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
