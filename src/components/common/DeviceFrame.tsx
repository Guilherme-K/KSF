import React from 'react';
import { Smartphone, Monitor, Tablet, Wifi, Battery, Signal } from 'lucide-react';

export type ViewMode = 'desktop' | 'tablet' | 'phone';

interface DeviceFrameProps {
  mode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  isOffline: boolean;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mode,
  onSelectMode,
  isOffline,
  children,
}) => {
  if (mode === 'desktop') {
    return <div className="min-h-screen bg-slate-50 w-full">{children}</div>;
  }

  const isTablet = mode === 'tablet';

  return (
    <div className="min-h-screen bg-slate-900/95 py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Device Mode Switcher Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 bg-slate-800/95 text-slate-200 px-4 py-2 rounded-2xl border border-slate-700 text-xs shadow-xl backdrop-blur-md">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
          {isTablet ? <Tablet className="w-4 h-4 text-indigo-400" /> : <Smartphone className="w-4 h-4 text-teal-400" />}
          <span>Simulador de Dispositivo (NFR01):</span>
        </span>

        <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => onSelectMode('phone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'phone' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Celular (390px)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'tablet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('desktop')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>100% Tela Cheia</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`relative w-full ${
          isTablet ? 'max-w-[820px]' : 'max-w-[414px]'
        } bg-slate-950 rounded-[44px] p-3.5 sm:p-4 shadow-2xl ring-1 ring-white/10 shadow-black/90 transition-all duration-300`}
      >
        {/* Notch / Camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-end px-2.5">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>

        {/* Inner Screen */}
        <div
          className={`relative bg-slate-50 rounded-[34px] overflow-hidden flex flex-col ${
            isTablet ? 'h-[920px]' : 'h-[780px]'
          } shadow-inner`}
        >
          {/* Mobile/Tablet Status Bar */}
          <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium z-40 select-none shrink-0">
            <span>09:41</span>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {isTablet ? 'iPad / Tablet 768px' : 'iPhone / Android 390px'}
              </span>
              <Signal className="w-3 h-3" />
              <Wifi className={`w-3 h-3 ${isOffline ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </div>

          {/* Bottom Home Indicator */}
          <div className="w-full bg-slate-900 py-1.5 flex justify-center shrink-0 z-40">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
