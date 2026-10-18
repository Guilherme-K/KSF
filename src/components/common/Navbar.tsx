import React from 'react';
import {
  Fish,
  Wifi,
  WifiOff,
  User,
  Monitor,
  Smartphone,
  RotateCcw,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  Clock,
  Layers,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  currentTab: 'catalog' | 'create-order' | 'orders' | 'reports';
  onSelectTab: (tab: 'catalog' | 'create-order' | 'orders' | 'reports') => void;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingCount: number;
  viewMode: 'desktop' | 'phone';
  onChangeViewMode: (mode: 'desktop' | 'phone') => void;
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
  viewMode,
  onChangeViewMode,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
      {/* Top Utility Ribbon */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Active Terminal / User Switcher (NFR03, NFR04) */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium hidden sm:inline">Active Terminal:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => onChangeUserRole('seller')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  userRole === 'seller'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Seller perspective (field phone, order creation, offline sync)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Seller (Phone)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeUserRole('manager')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  userRole === 'manager'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Manager perspective (computer desk, catalogs & sales reports)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Manager (Computer)</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              (NFR04: Unified permissions)
            </span>
          </div>

          {/* Right Controls: Network Simulation + Device Frame + Reset */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Network Simulator Button (FR16, FR18, FR19) */}
            <button
              type="button"
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
              }`}
              title="Click to simulate going offline or returning online to test order dispatch & auto-sync"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>OFFLINE MODE</span>
                  {pendingCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      {pendingCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ONLINE</span>
                  {pendingCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      {pendingCount} Syncing...
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Device View Frame Toggle (NFR01) */}
            <button
              type="button"
              onClick={() => onChangeViewMode(viewMode === 'desktop' ? 'phone' : 'desktop')}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all ${
                viewMode === 'phone'
                  ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Phone frame simulation vs Full desktop view"
            >
              {viewMode === 'phone' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Phone Frame ON</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop Full</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={onResetData}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
              title="Reset Catalog & Orders to initial demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('catalog')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">AquaTackle</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Fishing Equipment Orders & Management
              </p>
            </div>
          </div>

          {/* Tab Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('catalog')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'create-order'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-teal-700/60 hover:bg-teal-600 text-teal-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>New Order</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium relative transition-all ${
                currentTab === 'orders'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Orders</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-1.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'reports'
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Sales Reports</span>
              <span className="sm:hidden">Reports</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
