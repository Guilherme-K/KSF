import React from 'react';
import {
  Fish,
  Wifi,
  WifiOff,
  User,
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
  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        {/* Upper Utility Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Active User Switcher (NFR03, NFR04) */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium hidden lg:inline">Perfil:</span>
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => onChangeUserRole('seller')}
                  className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                    userRole === 'seller'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vendedor (Celular em campo, registro de pedidos)"
                >
                  <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Vendedor</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeUserRole('manager')}
                  className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                    userRole === 'manager'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Gerente (Computador de escritório, catálogo e relatórios)"
                >
                  <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Gerente</span>
                </button>
              </div>
            </div>

            {/* Right Controls: Network Simulator + Device Switcher + Reset */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Online/Offline Toggle (FR16, FR18, FR19) */}
              <button
                type="button"
                onClick={onToggleOffline}
                className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all border ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                }`}
                title="Clique para alternar entre Online e Offline para testar envio e auto-sincronização"
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
                  title="Modo Tela Inteira"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewMode('tablet')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Simular Tablet"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewMode('phone')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'phone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Simular Celular"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Data Button */}
              <button
                type="button"
                onClick={onResetData}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                title="Restaurar dados de demonstração iniciais"
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
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white">AquaTackle</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    CRM
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                  Sistema de Pedidos e Catálogo de Pesca
                </p>
              </div>
            </div>

            {/* Desktop / Tablet Navigation Links (hidden on mobile, visible on md+) */}
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
                <span>Catálogo</span>
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
                <span>Novo Pedido</span>
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
                <span>Pedidos</span>
                {pendingCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('reports')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                  currentTab === 'reports'
                    ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Relatórios</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (md:hidden) — Native App Experience on Phones and Small Tablets */}
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
            <span className="text-[10px]">Catálogo</span>
          </button>

          {/* Create Order Tab (Highlighted Center Button) */}
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
            <span className="text-[10px] mt-0.5">+ Pedido</span>
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
            <span className="text-[10px]">Pedidos</span>
            {pendingCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Reports Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('reports')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentTab === 'reports' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Relatórios</span>
          </button>
        </div>
      </div>
    </>
  );
};
