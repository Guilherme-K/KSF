import React from 'react';
import {
  Fish,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { UserRole } from '../../types';
import { ViewMode } from './DeviceFrame';

interface NavbarProps {
  currentTab: 'catalog' | 'create-order' | 'orders' | 'reports';
  onSelectTab: (tab: 'catalog' | 'create-order' | 'orders' | 'reports') => void;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingCount: number;
  draftCount?: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeUserRole,
  isOffline,
  onToggleOffline,
  pendingCount,
  draftCount = 0,
  viewMode,
  onChangeViewMode,
  onResetData,
}) => {
  const isSeller = userRole === 'seller';
  const isManager = userRole === 'manager';

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        {/* Upper Utility Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Active User Switcher (Seller vs Manager) */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium hidden lg:inline">Active User:</span>
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => onChangeUserRole('seller')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                    isSeller
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Seller Terminal (Orders & Catalog)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Seller</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeUserRole('manager')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                    isManager
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Manager Terminal (Catalog Management, Reports & Orders)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Manager</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400 hidden xl:inline ml-1">
                {isSeller ? '• Seller view (Reports & admin items hidden)' : '• Manager view (Full reports & catalog editing)'}
              </span>
            </div>

            {/* Right Controls: Network Simulator + Device Switcher + Reset */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Online/Offline Toggle (FR16, FR18, FR19) */}
              <button
                type="button"
                onClick={onToggleOffline}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all border ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                }`}
                title="Toggle Online / Offline to test order dispatch & auto-sync"
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>OFFLINE</span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full text-[9px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>ONLINE</span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full text-[9px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* View Mode Quick Selector (NFR01) */}
              <div className="hidden sm:inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => onChangeViewMode('desktop')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Full Screen Desktop"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewMode('tablet')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet Preview (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewMode('phone')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'phone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile Phone Preview (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Data Button */}
              <button
                type="button"
                onClick={onResetData}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                title="Reset demo data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => onSelectTab('catalog')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white">KSF</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    CRM
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                  Fishing Equipment Orders & Management
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (md:flex) */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('catalog')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                  currentTab === 'catalog'
                    ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('create-order')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all relative ${
                  currentTab === 'create-order'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-teal-700/60 hover:bg-teal-600 text-teal-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>New Order</span>
                {draftCount > 0 && (
                  <span className="bg-white text-teal-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {draftCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold relative transition-all ${
                  currentTab === 'orders'
                    ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Orders</span>
                {pendingCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Manager-Exclusive Tab: Sales Reports */}
              {isManager && (
                <button
                  type="button"
                  onClick={() => onSelectTab('reports')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                    currentTab === 'reports'
                      ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Manager Sales Reports (FR20)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Sales Reports</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Catalog Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'catalog' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Catalog</span>
          </button>

          {/* New Order Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('create-order')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              currentTab === 'create-order'
                ? 'text-teal-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-full ${currentTab === 'create-order' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-teal-400'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">+ Order</span>
            {draftCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                {draftCount}
              </span>
            )}
          </button>

          {/* Orders History Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              currentTab === 'orders' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Orders</span>
            {pendingCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Manager-Exclusive Reports Tab */}
          {isManager && (
            <button
              type="button"
              onClick={() => onSelectTab('reports')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                currentTab === 'reports' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Reports</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
