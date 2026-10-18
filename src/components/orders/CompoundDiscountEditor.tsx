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

  const { steps, finalUnitPrice, totalDiscountAmountPerUnit, effectivePercentage } =
    calculateCompoundPrice(basePrice, discounts);

  const handleAddDiscount = (val: number) => {
    if (val > 0 && val <= 99) {
      onChange([...discounts, val]);
      setCustomPercent('');
    }
  };

  const handleRemoveDiscount = (indexToRemove: number) => {
    const updated = discounts.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
          <Percent className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Descontos Compostos (FR13 / FR14)</span>
        </div>
        {discounts.length > 0 && (
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
            Total: -{effectivePercentage}% ({formatCurrency(totalDiscountAmountPerUnit)}/un)
          </span>
        )}
      </div>

      {/* Applied Discount Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        {discounts.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic">Nenhum desconto aplicado</span>
        ) : (
          discounts.map((pct, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
            >
              <span>Etapa {idx + 1}: -{pct}%</span>
              <button
                type="button"
                onClick={() => handleRemoveDiscount(idx)}
                className="hover:text-rose-900 hover:bg-rose-100 rounded-full p-0.5"
                title="Remover desconto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add discounts controls (Touch-friendly buttons) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
        <span className="text-[11px] text-slate-500 font-medium mr-0.5">Adicionar:</span>
        {[5, 10, 15, 20].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleAddDiscount(preset)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/50 active:bg-teal-100 transition-colors shadow-2xs min-h-[32px]"
          >
            +{preset}%
          </button>
        ))}

        <div className="inline-flex items-center gap-1 mt-1 sm:mt-0">
          <input
            type="number"
            min="1"
            max="99"
            placeholder="%"
            value={customPercent}
            onChange={(e) => setCustomPercent(e.target.value)}
            className="w-14 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden bg-white min-h-[32px]"
          />
          <button
            type="button"
            onClick={() => handleAddDiscount(Number(customPercent))}
            disabled={!customPercent || Number(customPercent) <= 0}
            className="px-2.5 py-1 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors min-h-[32px]"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Step-by-Step Compound Math Preview (FR14 Visualization) */}
      {steps.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 bg-white/80 rounded-lg p-2 text-xs">
          <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Cálculo Composto Passo a Passo (FR14):</span>
          </div>
          <div className="space-y-0.5 font-mono text-[10px] sm:text-[11px] text-slate-600">
            <div className="flex items-center justify-between text-slate-500">
              <span>Preço base unitário:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(basePrice)}</span>
            </div>
            {steps.map((st) => (
              <div key={st.step} className="flex items-center justify-between text-rose-700 pl-1.5">
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  Etapa {st.step}: {formatCurrency(st.fromPrice)} − {st.percentage}%
                </span>
                <span>= {formatCurrency(st.toPrice)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-300 text-slate-900 font-bold">
              <span>Preço unitário final:</span>
              <span className="text-teal-700">{formatCurrency(finalUnitPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
