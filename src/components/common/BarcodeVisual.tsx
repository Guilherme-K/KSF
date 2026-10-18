import React from 'react';

interface BarcodeVisualProps {
  value: string;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeVisual: React.FC<BarcodeVisualProps> = ({
  value,
  height = 36,
  showText = true,
  className = '',
}) => {
  // Deterministically generate pseudo-barcode line widths from the barcode string
  const cleanValue = value || '7890000000000';
  const bars: { width: number; isSpace: boolean }[] = [];

  // Start guard bar
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 1, isSpace: true });
  bars.push({ width: 1, isSpace: false });

  for (let i = 0; i < cleanValue.length; i++) {
    const charCode = cleanValue.charCodeAt(i);
    const w1 = ((charCode * 3) % 3) + 1;
    const s1 = ((charCode * 5) % 2) + 1;
    const w2 = ((charCode * 7) % 3) + 1;
    const s2 = ((charCode * 2) % 2) + 1;

    bars.push({ width: w1, isSpace: false });
    bars.push({ width: s1, isSpace: true });
    bars.push({ width: w2, isSpace: false });
    bars.push({ width: s2, isSpace: true });
  }

  // End guard bar
  bars.push({ width: 1, isSpace: false });
  bars.push({ width: 1, isSpace: true });
  bars.push({ width: 2, isSpace: false });

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  return (
    <div className={`inline-flex flex-col items-center bg-white px-2 py-1 rounded border border-slate-200 shadow-xs ${className}`}>
      <svg
        width={Math.min(totalWidth * 1.5, 160)}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {(() => {
          let currentX = 0;
          return bars.map((bar, index) => {
            const x = currentX;
            currentX += bar.width;
            if (bar.isSpace) return null;
            return (
              <rect
                key={index}
                x={x}
                y={0}
                width={bar.width}
                height={height}
                fill="#0f172a"
              />
            );
          });
        })()}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-widest text-slate-700 mt-0.5 select-all">
          {cleanValue}
        </span>
      )}
    </div>
  );
};
