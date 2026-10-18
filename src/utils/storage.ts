import { FishingItem, Order, UserRole } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ITEMS, INITIAL_ORDERS } from '../data/initialData';

const KEYS = {
  ITEMS: 'fishing_crm_items_v1',
  CATEGORIES: 'fishing_crm_categories_v1',
  ORDERS: 'fishing_crm_orders_v1',
  USER_ROLE: 'fishing_crm_user_role_v1',
  SIMULATED_OFFLINE: 'fishing_crm_sim_offline_v1',
};

// Broadcast channel for multi-tab live sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('fishing_crm_sync');
  }
} catch {
  // Graceful fallback if unsupported
}

export function notifySync(type: 'ITEMS' | 'ORDERS' | 'CATEGORIES' | 'ROLE') {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, timestamp: Date.now() });
  }
}

export function subscribeToSync(callback: (type: string) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type) {
      callback(event.data.type);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(INITIAL_CATEGORIES);
      return [...INITIAL_CATEGORIES].sort((a, b) => a.localeCompare(b));
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? [...parsed].sort((a, b) => a.localeCompare(b)) : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: string[]) {
  try {
    const sorted = [...categories].sort((a, b) => a.localeCompare(b));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(sorted));
    notifySync('CATEGORIES');
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadItems(): FishingItem[] {
  try {
    const raw = localStorage.getItem(KEYS.ITEMS);
    if (!raw) {
      saveItems(INITIAL_ITEMS);
      return [...INITIAL_ITEMS].sort((a, b) => a.name.localeCompare(b.name));
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? [...parsed].sort((a, b) => a.name.localeCompare(b.name)) : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: FishingItem[]) {
  try {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(sorted));
    notifySync('ITEMS');
  } catch (err) {
    console.error('Failed to save items', err);
  }
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (!raw) {
      saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    notifySync('ORDERS');
  } catch (err) {
    console.error('Failed to save orders', err);
  }
}

export function loadUserRole(): UserRole {
  try {
    const raw = localStorage.getItem(KEYS.USER_ROLE);
    if (raw === 'manager' || raw === 'seller') return raw;
    return 'seller';
  } catch {
    return 'seller';
  }
}

export function saveUserRole(role: UserRole) {
  try {
    localStorage.setItem(KEYS.USER_ROLE, role);
    notifySync('ROLE');
  } catch (err) {
    console.error('Failed to save user role', err);
  }
}

export function loadSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(KEYS.SIMULATED_OFFLINE) === 'true';
  } catch {
    return false;
  }
}

export function saveSimulatedOffline(isOffline: boolean) {
  try {
    localStorage.setItem(KEYS.SIMULATED_OFFLINE, isOffline ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save offline simulation state', err);
  }
}

/**
 * Synchronize any pending orders to 'Order registered'
 * Requirement FR19: When internet is back, the pending order is sent and its status changes to "Order registered"
 */
export function syncPendingOrders(): { count: number; updatedOrders: Order[] } {
  const orders = loadOrders();
  let updatedCount = 0;
  const now = new Date().toISOString();

  const updatedOrders = orders.map((ord) => {
    if (ord.status === 'Pending') {
      updatedCount++;
      return {
        ...ord,
        status: 'Order registered' as const,
        registeredAt: now,
      };
    }
    return ord;
  });

  if (updatedCount > 0) {
    saveOrders(updatedOrders);
  }

  return { count: updatedCount, updatedOrders };
}

/**
 * Reset data back to default initial state for test walkthroughs
 */
export function resetDemoData() {
  localStorage.removeItem(KEYS.ITEMS);
  localStorage.removeItem(KEYS.CATEGORIES);
  localStorage.removeItem(KEYS.ORDERS);
  localStorage.removeItem(KEYS.SIMULATED_OFFLINE);
  saveCategories(INITIAL_CATEGORIES);
  saveItems(INITIAL_ITEMS);
  saveOrders(INITIAL_ORDERS);
}
