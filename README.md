# 🎣 AquaTackle CRM — Visual Prototype

A modern visual prototype for a specialized Fishing Equipment CRM and Sales & Order Management system, designed for **2 key users: Seller and Manager**, with multi-device support, compound discount calculations, barcode catalog, offline dispatch with auto-synchronization, and date-filtered sales reporting.

Ready to deploy on **Vercel** with **Vite + React + TypeScript + Tailwind CSS**.

---

## 🌟 Key Features & Requirements Coverage

### 📦 1. Catalog Module (FR01 – FR07)
* **FR01**: Catalog of fishing items organized by category (*Rods*, *Reels*, *Lures*, *Lines*, *Hooks & Terminal*, *Accessories*). Includes sample item `"APA Rod"`.
* **FR02**: Categories are listed in **strict alphabetical order** (A to Z).
* **FR03**: Items inside each category are listed in **strict alphabetical order** (A to Z).
* **FR04**: User can **add a new item** to any existing category or create a new category.
* **FR05**: User can **delete an item** from a category with confirmation.
* **FR06**: Every item has a **barcode registered** on it with a live visual SVG barcode preview and auto-generator.
* **FR07**: Every item has a **price registered** on it, together with the barcode.

### 🛒 2. Orders & Commercial Dispatch Module (FR08 – FR19)
* **FR08**: The seller can create new orders.
* **FR09**: The seller enters the customer name on the order (e.g. `"Fishing Store"`, with quick autocomplete chips).
* **FR10**: The seller adds items to the order, each with quantity controls (`+` / `-`).
* **FR11**: Each order item displays its registered unit price.
* **FR12**: Each order item displays its registered barcode.
* **FR13**: The seller can apply percentage discounts to an order item.
* **FR14**: **Compound Discounts**: Multiple discounts on the same item apply sequentially on the already discounted price:
  $$\text{Example: } \$100 \xrightarrow{-10\%} \$90 \xrightarrow{-10\%} \$81$$
  *Interactive visual compound math breakdown displays each step clearly.*
* **FR15**: Each order item displays its total price ($\text{quantity} \times \text{unit price with compound discounts}$).
* **FR16**: The order displays its total price, gross subtotal, and total discount savings.
* **FR17**: The seller dispatches the order to the computer terminal.
* **FR18 & FR19: Offline Queue & Auto-Sync**:
  * If there is no internet when the order is sent, the order stays with status **"Pending"** (FR18).
  * When internet is restored, pending orders are automatically dispatched and status updates to **"Order registered"** (FR19).
  * Includes an interactive **Network Simulator toggle** (`🟢 Online` <-> `🔴 Offline Mode`) in the header to easily demonstrate this behavior.
* **FR18 (PDF)**: One-click downloadable PDF with full order details (customer name, item table, barcodes, quantities, unit prices, compound discounts, totals, and signature boxes).

### 📊 3. Sales Reports Module (FR20 – FR22)
* **FR20**: The manager (on the computer terminal) can generate a comprehensive sales report.
* **FR21**: The manager chooses the time period of the report (e.g. starting on `07/10`, custom date range, or presets).
* **FR22**: Shows how many sales were made in the chosen period, even if generated later (e.g. generated on `07/11` or today).
* Includes KPI summary cards, Category revenue breakdown progress bars, Best-selling fishing items table, Customer store leaderboard, and PDF report export.

### 📱 4. Multi-Device & Permissions Architecture (NFR01 – NFR05)
* **NFR01**: Responsive layout optimized for desktop computer and 1–2 smartphones. Includes a **Device Simulation Frame** toggle in the top bar to preview the mobile phone experience.
* **NFR02**: Cross-location ready (client-side persistence in `localStorage` + `BroadcastChannel` for multi-tab sync, zero server dependencies, instant Vercel deploy).
* **NFR03 & NFR04**: Designed for 2 users (Seller and Manager) with unified permissions across catalog and orders, plus a profile toggle to switch active terminal context.
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

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**!

A `vercel.json` file is already included with single-page app rewrite rules.

---

## 🧪 Testing the Requirements

1. **Test Alphabetical Ordering (FR02, FR03)**:
   * Go to **Catalog**. Note categories are sorted A-Z (*Accessories*, *Hooks & Terminal*, *Lines*, *Lures*, *Reels*, *Rods*).
   * Inside each category, items like `"APA Rod"` appear sorted alphabetically.
2. **Test Adding Item (FR04, FR06, FR07)**:
   * Click **"+ Add Item"**. Enter name, barcode, and price. Notice the item immediately sorts into place.
3. **Test Compound Discounts (FR13, FR14)**:
   * Go to **"New Order"**, select `"APA Rod"`.
   * Add a `10%` discount, then another `10%` discount. Notice the step-by-step breakdown:
     `$89.90 -> -10% = $80.91 -> -10% = $72.82`.
4. **Test Offline Sync (FR18, FR19)**:
   * Click **"ONLINE"** in the top bar to switch to **"OFFLINE MODE"**.
   * Create an order and click **"Send Order"**. The order saves as **"Pending"**.
   * Toggle back to **"ONLINE"**. Notice the toast notification and status changing to **"Order registered"**!
5. **Test PDF Generation (FR18)**:
   * Click **"Download PDF"** on any order to download an invoice.
6. **Test Sales Reports (FR20, FR21, FR22)**:
   * Click **"Sales Reports"**. Click **"★ Starting 07/10 (FR21 Demo)"**. Notice sales made on 07/10, 07/11, and onwards are accurately aggregated.
