import { FishingItem, Order } from '../types';
import { buildOrderItem, calculateOrderTotals } from '../utils/discounts';

export const INITIAL_CATEGORIES = [
  'Accessories',
  'Hooks & Terminal',
  'Lines',
  'Lures',
  'Reels',
  'Rods',
];

export const INITIAL_ITEMS: FishingItem[] = [
  // Rods
  {
    id: 'item-rod-01',
    name: 'APA Rod',
    category: 'Rods',
    barcode: '7891001002014',
    price: 89.90,
    description: 'High-modulus carbon fiber fishing rod, 6ft 6in medium-heavy action.',
    stock: 24,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-rod-02',
    name: 'Carbon Master Rod',
    category: 'Rods',
    barcode: '7891001002021',
    price: 135.00,
    description: 'Tournament grade spinning rod with titanium oxide guides.',
    stock: 15,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-rod-03',
    name: 'Fiberglass Surf Rod',
    category: 'Rods',
    barcode: '7891001002038',
    price: 65.50,
    description: 'Heavy duty saltwater 10ft surf casting rod.',
    stock: 30,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-rod-04',
    name: 'Telescopic Travel Rod',
    category: 'Rods',
    barcode: '7891001002045',
    price: 49.00,
    description: 'Compact 7-section collapsible rod for backpackers and travelers.',
    stock: 40,
    createdAt: '2026-06-03T10:00:00Z',
  },

  // Reels
  {
    id: 'item-reel-01',
    name: 'Apex Baitcasting Reel',
    category: 'Reels',
    barcode: '7892002003011',
    price: 119.00,
    description: '7.1:1 high gear ratio with magnetic brake and carbon matrix drag.',
    stock: 18,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-reel-02',
    name: 'Oceanic Spinning Reel 4000',
    category: 'Reels',
    barcode: '7892002003028',
    price: 78.50,
    description: 'Corrosion-resistant sealed saltwater reel with 10+1 bearings.',
    stock: 22,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-reel-03',
    name: 'Titan 5000 Heavy Duty Reel',
    category: 'Reels',
    barcode: '7892002003035',
    price: 159.00,
    description: 'Massive line capacity for deep sea game fishing.',
    stock: 10,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-reel-04',
    name: 'Vortex Trolling Reel',
    category: 'Reels',
    barcode: '7892002003042',
    price: 95.00,
    description: 'Level wind trolling reel with loud clicker alarm.',
    stock: 12,
    createdAt: '2026-06-03T10:00:00Z',
  },

  // Lures
  {
    id: 'item-lure-01',
    name: 'Deep Diver Crankbait 15ft',
    category: 'Lures',
    barcode: '7893003004018',
    price: 14.50,
    description: 'Realistic rattle action with razor-sharp treble hooks.',
    stock: 85,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-lure-02',
    name: 'Laser Minnow Jerkbait',
    category: 'Lures',
    barcode: '7893003004025',
    price: 12.00,
    description: 'Holographic suspending minnow lure for predatory bass and game fish.',
    stock: 60,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-lure-03',
    name: 'Popper Topwater Frog',
    category: 'Lures',
    barcode: '7893003004032',
    price: 9.80,
    description: 'Weedless hollow body surface frog for heavy vegetation.',
    stock: 70,
    createdAt: '2026-06-03T10:00:00Z',
  },
  {
    id: 'item-lure-04',
    name: 'Soft Plastic Grub Pack 10x',
    category: 'Lures',
    barcode: '7893003004049',
    price: 8.50,
    description: 'Scent-infused curly tail grubs in assorted attractant colors.',
    stock: 120,
    createdAt: '2026-06-04T10:00:00Z',
  },

  // Lines
  {
    id: 'item-line-01',
    name: 'Braided Braid 50lb 300m',
    category: 'Lines',
    barcode: '7894004005015',
    price: 28.00,
    description: '8-strand high density moss green braid, zero stretch.',
    stock: 45,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-line-02',
    name: 'Fluorocarbon Leader 20lb 50m',
    category: 'Lines',
    barcode: '7894004005022',
    price: 22.00,
    description: '100% invisible underwater leader line with high abrasion resistance.',
    stock: 50,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-line-03',
    name: 'Monofilament Clear 15lb 500m',
    category: 'Lines',
    barcode: '7894004005039',
    price: 16.00,
    description: 'Smooth casting mono with controlled stretch and shock absorption.',
    stock: 65,
    createdAt: '2026-06-03T10:00:00Z',
  },

  // Hooks & Terminal
  {
    id: 'item-hook-01',
    name: 'Circle Hooks #2 (25pk)',
    category: 'Hooks & Terminal',
    barcode: '7895005006012',
    price: 7.50,
    description: 'Forged black nickel circle hooks designed for catch and release.',
    stock: 110,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-hook-02',
    name: 'Jig Heads 1/2oz (10pk)',
    category: 'Hooks & Terminal',
    barcode: '7895005006029',
    price: 9.00,
    description: 'Heavy duty saltwater resistant jig heads with barbed collar.',
    stock: 80,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-hook-03',
    name: 'Swivel Snap Kit 50pcs',
    category: 'Hooks & Terminal',
    barcode: '7895005006036',
    price: 11.50,
    description: 'Stainless steel ball bearing barrel swivels with interlock snaps.',
    stock: 95,
    createdAt: '2026-06-03T10:00:00Z',
  },

  // Accessories
  {
    id: 'item-acc-01',
    name: 'Bait Aerator Pump Portable',
    category: 'Accessories',
    barcode: '7896006007019',
    price: 32.00,
    description: 'Battery powered quiet aerator pump for live bait buckets.',
    stock: 20,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'item-acc-02',
    name: 'Fillet Knife Pro 7-inch',
    category: 'Accessories',
    barcode: '7896006007026',
    price: 24.50,
    description: 'Flexible German stainless steel blade with non-slip rubber grip.',
    stock: 35,
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'item-acc-03',
    name: 'Tackle Box 4-Tray Deluxe',
    category: 'Accessories',
    barcode: '7896006007033',
    price: 42.00,
    description: 'Heavy impact plastic box with cantilever trays and waterproof seal.',
    stock: 18,
    createdAt: '2026-06-03T10:00:00Z',
  },
];

// Helper to construct sample orders
function createSampleOrder(
  id: string,
  orderNumber: string,
  customerName: string,
  itemsConfig: Array<{
    item: FishingItem;
    quantity: number;
  }>,
  createdAt: string,
  status: 'Pending' | 'Order registered' = 'Order registered',
  notes?: string
): Order {
  const items = itemsConfig.map(({ item, quantity }) =>
    buildOrderItem(
      {
        itemId: item.id,
        name: item.name,
        category: item.category,
        barcode: item.barcode,
        price: item.price,
      },
      quantity
    )
  );

  const totals = calculateOrderTotals(items);

  return {
    id,
    orderNumber,
    customerName,
    items,
    subtotal: totals.subtotal,
    totalPrice: totals.totalPrice,
    status,
    createdAt,
    registeredAt: status === 'Order registered' ? createdAt : undefined,
    createdBy: 'seller',
    notes,
  };
}

export const INITIAL_ORDERS: Order[] = [
  // Orders placed on 2026-07-10 (FR21: starting on 07/10)
  createSampleOrder(
    'ord-001',
    'ORD-2026-0710-01',
    'Fishing Store',
    [
      { item: INITIAL_ITEMS[0], quantity: 3 }, // APA Rod
      { item: INITIAL_ITEMS[4], quantity: 2 }, // Apex Reel
      { item: INITIAL_ITEMS[12], quantity: 5 }, // Braided Line
    ],
    '2026-07-10T09:30:00Z',
    'Order registered',
    'Delivered to main harbor store'
  ),
  createSampleOrder(
    'ord-002',
    'ORD-2026-0710-02',
    'Ocean Baits & Tackle',
    [
      { item: INITIAL_ITEMS[8], quantity: 15 }, // Crankbaits
      { item: INITIAL_ITEMS[9], quantity: 10 }, // Minnow Jerkbait
      { item: INITIAL_ITEMS[15], quantity: 20 }, // Circle hooks
    ],
    '2026-07-10T14:15:00Z',
    'Order registered'
  ),

  // Orders placed on 2026-07-11 (FR22: generated on 07/11)
  createSampleOrder(
    'ord-003',
    'ORD-2026-0711-01',
    'Fishing Store',
    [
      { item: INITIAL_ITEMS[1], quantity: 2 }, // Carbon Master Rod
      { item: INITIAL_ITEMS[5], quantity: 2 }, // Oceanic Spinning Reel
      { item: INITIAL_ITEMS[19], quantity: 2 }, // Tackle Box
    ],
    '2026-07-11T11:00:00Z',
    'Order registered',
    'Repeat storefront customer'
  ),
  createSampleOrder(
    'ord-004',
    'ORD-2026-0711-02',
    'Rio & Mar Outfitters',
    [
      { item: INITIAL_ITEMS[0], quantity: 4 }, // APA Rod
      { item: INITIAL_ITEMS[13], quantity: 6 }, // Fluorocarbon Leader
    ],
    '2026-07-11T16:45:00Z',
    'Order registered'
  ),

  // Orders placed on 2026-07-15
  createSampleOrder(
    'ord-005',
    'ORD-2026-0715-01',
    'Lagoon Anglers Club',
    [
      { item: INITIAL_ITEMS[6], quantity: 1 }, // Titan Reel
      { item: INITIAL_ITEMS[2], quantity: 2 }, // Surf Rod
      { item: INITIAL_ITEMS[18], quantity: 3 }, // Fillet Knife
    ],
    '2026-07-15T10:20:00Z',
    'Order registered'
  ),

  // Demonstrative Pending order (FR16/FR18)
  createSampleOrder(
    'ord-006',
    'ORD-2026-0718-01',
    'Fishing Store',
    [
      { item: INITIAL_ITEMS[0], quantity: 2 }, // APA Rod
      { item: INITIAL_ITEMS[10], quantity: 5 }, // Topwater Frogs
    ],
    '2026-07-18T13:10:00Z',
    'Pending',
    'Drafted offline in remote marina dock'
  ),
];
