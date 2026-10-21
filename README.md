# 🎣 ksf CRM — Visual Prototype

A modern visual prototype for a specialized Fishing Equipment CRM and Sales & Order Management system, designed for **2 key users: Seller and Manager**, with multi-device responsive support (Mobile, Tablet, Desktop), barcode catalog, offline order dispatch with auto-synchronization, and date-filtered sales reporting.

Ready to deploy on **Vercel** with **Vite + React + TypeScript + Tailwind CSS**.

---

## 🌟 Key Features & Requirements Coverage

### 👤 Role-Based View Switcher (Seller vs Manager)
Anyone can toggle the active user role switch in the top bar:
* **Seller Mode (Field Terminal)**:
  * Tailored for field representatives visiting tackle shops and stores.
  * Can browse the **Catalog** and add items directly to an active order draft (`+ Order`).
  * Creates commercial orders with customer name and quantity controls.
  * Works online or offline with auto-sync when internet returns.
  * Downloads printable PDF invoices.
  * **Manager-only items are hidden**: Sales Reports and Catalog management (Add Item / Delete Item) are hidden for the Seller.
* **Manager Mode (Computer Terminal)**:
  * Full administrative access to the **Catalog**: Add new items (FR04), create categories, and delete items (FR05).
  * Full access to **Orders History & Dispatch Queue**.
  * Full access to **Sales Reports** (FR20, FR21, FR22): Pick time periods (e.g. starting on `07/10`), review net revenue, top-selling gear, customer store leaderboard, and export PDF reports.

---

### 📦 1. Catalog Module (FR01 – FR07)
* **FR01**: Catalog of fishing items organized by category (*Rods*, *Reels*, *Lures*, *Lines*, *Hooks & Terminal*, *Accessories*). Includes sample item `"APA Rod"`.
* **FR02**: Categories are listed in **strict alphabetical order** (A to Z).
* **FR03**: Items inside each category are listed in **strict alphabetical order** (A to Z).
* **FR04**: Manager can **add a new item** to any category or create a new category.
* **FR05**: Manager can **delete an item** from a category with safety confirmation.
* **FR06**: Every item has a **barcode registered** on it with a live visual SVG barcode preview and auto-generator.
* **FR07**: Every item has a **price registered** on it, together with the barcode.

---

### 🛒 2. Orders & Commercial Dispatch Module (FR08 – FR19)
* **FR08**: The seller can create new commercial orders.
* **FR09**: The seller enters the customer name on the order (e.g. `"Fishing Store"`, with quick autocomplete chips).
* **FR10**: The seller adds items to the order, each with quantity controls (`+` / `-`).
* **FR11**: Each order item displays its registered unit price.
* **FR12**: Each order item displays its registered barcode.
* **FR13**: Each order item displays its total price ($\text{quantity} \times \text{unit price}$).
* **FR14**: The order displays its total price.
* **FR15 / FR17**: The seller dispatches the order to the computer terminal.
* **FR16 / FR18 & FR19: Offline Queue & Auto-Sync**:
  * If there is no internet when the order is sent, the order stays with status **"Pending"** (FR18).
  * When internet is restored, pending orders are automatically dispatched and status updates to **"Order registered"** (FR19).
  * Includes an interactive **Network Simulator toggle** (`🟢 Online` <-> `🔴 Offline Mode`) in the header to easily demonstrate this behavior.
* **FR18 (PDF)**: One-click downloadable PDF with full order details (customer name, item table, barcodes, quantities, unit prices, totals, and signature boxes).

---

### 📊 3. Sales Reports Module (FR20 – FR22)
* **FR20**: The manager (on the computer terminal) can generate a comprehensive sales report.
* **FR21**: The manager chooses the time period of the report (e.g. starting on `07/10`, custom date range, or presets).
* **FR22**: Shows how many sales were made in the chosen period, even if generated later (e.g. generated on `07/11` or today).
* Includes KPI summary cards, Category revenue breakdown progress bars, Best-selling fishing items table, Customer store leaderboard, and PDF report export.

---

### 📱 4. Multi-Device & Mobile Responsiveness (NFR01 – NFR05)
* **NFR01**: Responsive layout optimized for smartphones, tablets, and computers:
  * **Mobile Bottom Navigation Bar** for one-handed thumb navigation on phones and small tablets.
  * **Mobile Sticky Dispatch Bar** above the bottom nav for 1-tap order dispatch without scrolling.
  * **Device Simulation Frame** in the top bar to preview the app in **Phone (390px)**, **Tablet (768px)**, or **Desktop Full** view.
* **NFR02**: Cross-location ready (client-side persistence in `localStorage` + `BroadcastChannel` for multi-tab sync, zero server dependencies, instant Vercel deploy).
* **NFR03 & NFR04**: Designed for 2 users (Seller and Manager) with active role switching determining what is displayed.
* **NFR05**: Full offline usability.

---

## 🚀 Getting Started

### Local Development

1. Navigate to the project directory:
   ```bash
   cd fishing-crm-prototype
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The output will be generated in `dist/`.

