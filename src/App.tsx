import React, { useState, useEffect, useCallback } from 'react';
import { FishingItem, Order, OrderItem, UserRole } from './types';
import {
  loadCategories,
  saveCategories,
  loadItems,
  saveItems,
  loadOrders,
  saveOrders,
  loadUserRole,
  saveUserRole,
  loadSimulatedOffline,
  saveSimulatedOffline,
  syncPendingOrders,
  resetDemoData,
  subscribeToSync,
} from './utils/storage';
import { buildOrderItem } from './utils/discounts';
import { Navbar } from './components/common/Navbar';
import { DeviceFrame } from './components/common/DeviceFrame';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { CatalogView } from './components/catalog/CatalogView';
import { CreateOrderView } from './components/orders/CreateOrderView';
import { OrdersListView } from './components/orders/OrdersListView';
import { SalesReportView } from './components/reports/SalesReportView';

export function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'create-order' | 'orders' | 'reports'>('catalog');
  const [userRole, setUserRole] = useState<UserRole>(loadUserRole);
  const [isOffline, setIsOffline] = useState<boolean>(loadSimulatedOffline);
  const [viewMode, setViewMode] = useState<'desktop' | 'phone'>('desktop');

  // Core Data
  const [categories, setCategories] = useState<string[]>(loadCategories);
  const [items, setItems] = useState<FishingItem[]>(loadItems);
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  // Active Draft Order State (persists across tab navigation)
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [draftCustomerName, setDraftCustomerName] = useState<string>('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Reload data from local storage (used on sync & initial load)
  const refreshData = useCallback(() => {
    setCategories(loadCategories());
    setItems(loadItems());
    setOrders(loadOrders());
    setUserRole(loadUserRole());
  }, []);

  // Subscribe to multi-tab sync (BroadcastChannel)
  useEffect(() => {
    const unsubscribe = subscribeToSync((syncType) => {
      refreshData();
      if (syncType === 'ORDERS') {
        addToast('info', 'Orders Synced', 'Received updated order data from another active terminal.');
      }
    });
    return unsubscribe;
  }, [refreshData, addToast]);

  // Requirement FR19: Sync pending orders when internet comes back
  const handlePerformSync = useCallback(() => {
    const { count, updatedOrders } = syncPendingOrders();
    if (count > 0) {
      setOrders(updatedOrders);
      addToast(
        'success',
        'Auto-Sync Complete! (FR19)',
        `${count} pending order${count === 1 ? '' : 's'} registered on computer.`
      );
    }
  }, [addToast]);

  // Toggle offline simulator (FR18, FR19)
  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    saveSimulatedOffline(nextState);

    if (nextState) {
      addToast(
        'warning',
        'Simulating Offline Mode (FR18)',
        'Orders submitted now will have status "Pending" until online.'
      );
    } else {
      addToast(
        'success',
        'Connection Restored (FR19)',
        'Online status active. Triggering automatic pending order dispatch.'
      );
      // Auto sync pending orders
      setTimeout(() => {
        handlePerformSync();
      }, 500);
    }
  };

  // Change user role
  const handleUserRoleChange = (role: UserRole) => {
    setUserRole(role);
    saveUserRole(role);
    if (role === 'manager') {
      addToast('info', 'Manager Terminal Active', 'Computer desk mode: Accessing sales reports and catalog.');
    } else {
      addToast('info', 'Seller Terminal Active', 'Mobile phone mode: Ready to visit stores and take orders.');
    }
  };

  // Catalog Handlers (FR04, FR05)
  const handleAddItem = (newItemData: Omit<FishingItem, 'id' | 'createdAt'>) => {
    const newItem: FishingItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
    addToast('success', 'Item Registered (FR04)', `"${newItem.name}" added with barcode ${newItem.barcode}.`);
  };

  const handleDeleteItem = (itemId: string) => {
    const target = items.find((it) => it.id === itemId);
    const updated = items.filter((it) => it.id !== itemId);
    setItems(updated);
    saveItems(updated);
    addToast('info', 'Item Removed (FR05)', target ? `"${target.name}" removed from catalog.` : undefined);
  };

  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      saveCategories(updated);
      addToast('success', 'Category Created', `Category "${newCat}" added.`);
    }
  };

  // Quick Add from Catalog to Order
  const handleQuickAddToOrder = (item: FishingItem) => {
    // Check if already in draft
    const existingIndex = draftItems.findIndex((d) => d.itemId === item.id);
    if (existingIndex >= 0) {
      const updated = [...draftItems];
      const cur = updated[existingIndex];
      updated[existingIndex] = buildOrderItem(
        {
          itemId: item.id,
          name: item.name,
          category: item.category,
          barcode: item.barcode,
          price: item.price,
        },
        cur.quantity + 1,
        cur.discounts
      );
      setDraftItems(updated);
    } else {
      const newItem = buildOrderItem(
        {
          itemId: item.id,
          name: item.name,
          category: item.category,
          barcode: item.barcode,
          price: item.price,
        },
        1,
        []
      );
      setDraftItems([...draftItems, newItem]);
    }

    addToast('info', 'Added to Draft Order', `"${item.name}" added with quantity 1.`);
  };

  // Save order handler
  const handleSaveOrder = (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);

    if (newOrder.status === 'Order registered') {
      addToast(
        'success',
        'Order Registered! (FR17)',
        `Order #${newOrder.orderNumber} for "${newOrder.customerName}" sent to computer.`
      );
    } else {
      addToast(
        'warning',
        'Order Pending (FR18)',
        `Order #${newOrder.orderNumber} saved offline. Will auto-register once online.`
      );
    }
  };

  // Reset to default demo data
  const handleResetDemo = () => {
    if (window.confirm('Reset catalog items and orders back to default demo state?')) {
      resetDemoData();
      refreshData();
      setDraftItems([]);
      setDraftCustomerName('');
      addToast('info', 'Demo Data Restored', 'Catalog, sample orders, and categories reset.');
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main App Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onChangeUserRole={handleUserRoleChange}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingCount={pendingCount}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onResetData={handleResetDemo}
      />

      {/* Device Frame Wrapper (supports Phone simulation or Full Desktop) */}
      <DeviceFrame
        mode={viewMode}
        onToggleMode={() => setViewMode(viewMode === 'desktop' ? 'phone' : 'desktop')}
        isOffline={isOffline}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {currentTab === 'catalog' && (
            <CatalogView
              items={items}
              categories={categories}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onAddCategory={handleAddCategory}
              onQuickAddToOrder={handleQuickAddToOrder}
            />
          )}

          {currentTab === 'create-order' && (
            <CreateOrderView
              catalogItems={items}
              isOffline={isOffline}
              draftItems={draftItems}
              customerName={draftCustomerName}
              onUpdateDraftItems={setDraftItems}
              onUpdateCustomerName={setDraftCustomerName}
              onSaveOrder={handleSaveOrder}
              onNavigateToOrders={() => setCurrentTab('orders')}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersListView
              orders={orders}
              isOffline={isOffline}
              onSyncPending={handlePerformSync}
              onCreateNewOrder={() => setCurrentTab('create-order')}
            />
          )}

          {currentTab === 'reports' && <SalesReportView orders={orders} />}
        </main>
      </DeviceFrame>

      {/* Sticky Bottom Ribbon on Desktop: quick stats & requirements reminder */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-3 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AquaTackle Fishing CRM Prototype</span>
            <span className="text-slate-400">• Vercel Ready</span>
            <span className="text-slate-400">• Multi-device (NFR01)</span>
            <span className="text-slate-400">• Offline Sync (FR18/19, NFR05)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Catalog: <strong className="text-slate-700">{items.length} items</strong>
            </span>
            <span>
              Orders: <strong className="text-slate-700">{orders.length} orders</strong>
            </span>
            {pendingCount > 0 && (
              <span className="text-amber-600 font-bold">
                ({pendingCount} pending offline)
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
