import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  mode: 'desktop' | 'phone';
  onToggleMode: () => void;
  isOffline: boolean;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mode,
  onToggleMode,
  isOffline,
  children,
}) => {
  if (mode === 'desktop') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900/90 py-8 px-4 flex flex-col items-center justify-start">
      {/* Simulation Info Pill */}
      <div className="mb-4 flex items-center gap-3 bg-slate-800/90 text-slate-200 px-4 py-1.5 rounded-full border border-slate-700 text-xs shadow-lg backdrop-blur-md">
        <Smartphone className="w-4 h-4 text-teal-400" />
        <span className="font-semibold">Simulating: Seller Field Phone (NFR01)</span>
        <button
          type="button"
          onClick={onToggleMode}
          className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-white transition-colors"
        >
          Switch to Desktop View
        </button>
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="relative w-full max-w-[420px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl ring-1 ring-white/10 shadow-black/80">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
        </div>

        {/* Inner Phone Screen */}
        <div className="relative bg-slate-50 rounded-[38px] overflow-hidden flex flex-col h-[820px] shadow-inner">
          {/* Mobile Status Bar */}
          <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium z-40 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className={`w-3 h-3 ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`} />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Phone Scrollable App Content */}
          <div className="flex-1 overflow-y-auto pb-10 scrollbar-thin">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/60 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
