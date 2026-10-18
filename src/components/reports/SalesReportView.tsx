import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Order, SalesReportSummary } from '../../types';
import { formatCurrency, formatShortDate, formatDate } from '../../utils/discounts';
import { generateSalesReportPDF } from '../../utils/pdfGenerator';

interface SalesReportViewProps {
  orders: Order[];
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({ orders }) => {
  // Requirement FR21: The manager chooses the time period of the report (e.g. starting on 07/10)
  const [startDate, setStartDate] = useState<string>('2026-07-10');
  const [endDate, setEndDate] = useState<string>('2026-07-31');
  const [activePreset, setActivePreset] = useState<string>('07-10-demo');

  // Compute summary for the chosen period (FR22)
  const summary: SalesReportSummary = useMemo(() => {
    // Normalize date strings for comparison
    const startObj = new Date(`${startDate}T00:00:00Z`);
    const endObj = new Date(`${endDate}T23:59:59Z`);

    const filtered = orders.filter((o) => {
      const ordDate = new Date(o.createdAt);
      return ordDate >= startObj && ordDate <= endObj;
    });

    let totalRevenue = 0;
    let registeredCount = 0;
    let pendingCount = 0;

    const customerMap: { [name: string]: { count: number; total: number } } = {};
    const itemMap: {
      [name: string]: { category: string; barcode: string; quantity: number; revenue: number };
    } = {};
    const categoryMap: { [cat: string]: { quantity: number; revenue: number } } = {};

    for (const ord of filtered) {
      totalRevenue += ord.totalPrice;
      if (ord.status === 'Order registered') registeredCount++;
      if (ord.status === 'Pending') pendingCount++;

      // Customer breakdown
      if (!customerMap[ord.customerName]) {
        customerMap[ord.customerName] = { count: 0, total: 0 };
      }
      customerMap[ord.customerName].count += 1;
      customerMap[ord.customerName].total += ord.totalPrice;

      // Item & Category breakdown
      for (const item of ord.items) {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            category: item.category,
            barcode: item.barcode,
            quantity: 0,
            revenue: 0,
          };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.totalPrice;

        if (!categoryMap[item.category]) {
          categoryMap[item.category] = { quantity: 0, revenue: 0 };
        }
        categoryMap[item.category].quantity += item.quantity;
        categoryMap[item.category].revenue += item.totalPrice;
      }
    }

    const customerBreakdown = Object.entries(customerMap)
      .map(([customerName, data]) => ({
        customerName,
        orderCount: data.count,
        totalSpent: Math.round(data.total * 100) / 100,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({
        name,
        category: data.category,
        barcode: data.barcode,
        quantitySold: data.quantity,
        totalRevenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        quantitySold: data.quantity,
        totalRevenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const totalSalesCount = filtered.length;
    const averageOrderValue =
      totalSalesCount > 0 ? Math.round((totalRevenue / totalSalesCount) * 100) / 100 : 0;

    return {
      periodLabel: `${formatShortDate(startDate)} to ${formatShortDate(endDate)}`,
      startDate,
      endDate,
      totalSalesCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      registeredCount,
      pendingCount,
      averageOrderValue,
      customerBreakdown,
      topItems,
      categoryBreakdown,
      orders: filtered,
    };
  }, [orders, startDate, endDate]);

  const handleApplyPreset = (preset: string) => {
    setActivePreset(preset);
    if (preset === '07-10-demo') {
      setStartDate('2026-07-10');
      setEndDate('2026-07-31');
    } else if (preset === 'today') {
      const todayStr = '2026-07-18';
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      setStartDate('2026-07-10');
      setEndDate('2026-07-17');
    } else if (preset === 'all') {
      setStartDate('2026-06-01');
      setEndDate('2026-12-31');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Manager Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manager Sales Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Computer Terminal (FR20)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate period-based sales analytics, revenue figures, and export audit PDFs (FR20, FR21, FR22).
          </p>
        </div>

        <button
          type="button"
          onClick={() => generateSalesReportPDF(summary)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Report to PDF</span>
        </button>
      </div>

      {/* Date Period Chooser (FR21: Manager chooses time period, e.g. starting on 07/10) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Choose Time Period for Report (FR21)</span>
          </label>
          <span className="text-xs text-slate-400">
            Requirement FR22: Shows how many sales were made in the period, even if generated later
          </span>
        </div>

        {/* Date Inputs & Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Start Date (e.g. 07/10) *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
              <span className="text-xs text-slate-400 mr-1">Period Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('07-10-demo')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activePreset === '07-10-demo'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                }`}
                title="Loads sample period starting on 07/10 as requested in FR21"
              >
                ★ Starting 07/10 (FR21 Demo)
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('week')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  activePreset === 'week'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                07/10 - 07/17
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  activePreset === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                All Records
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards (FR22) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Sales Count */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales (FR22)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalSalesCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Orders made in chosen period
          </span>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tracking-tight">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <span className="text-xs text-teal-600/80 mt-1 block font-medium">
            Net commercial volume
          </span>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(summary.averageOrderValue)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Average ticket per store
          </span>
        </div>

        {/* Card 4: Registered vs Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registration Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-emerald-600">{summary.registeredCount} Reg</span>
            <span className="text-slate-300">/</span>
            <span className="text-amber-600">{summary.pendingCount} Pend</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Synchronized to computer
          </span>
        </div>
      </div>

      {/* Category Breakdown & Customer Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Revenue by Fishing Category</span>
            </h3>
            <span className="text-xs text-slate-400">{summary.categoryBreakdown.length} categories</span>
          </div>

          {summary.categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No category sales in this period.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {summary.categoryBreakdown.map((cat) => {
                const percent =
                  summary.totalRevenue > 0
                    ? Math.round((cat.totalRevenue / summary.totalRevenue) * 100)
                    : 0;

                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cat.category}</span>
                      <span className="text-slate-600">
                        {formatCurrency(cat.totalRevenue)} ({percent}%) • {cat.quantitySold} units
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Sales Volume by Store / Customer</span>
            </h3>
            <span className="text-xs text-slate-400">{summary.customerBreakdown.length} stores</span>
          </div>

          {summary.customerBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No customer sales in this period.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {summary.customerBreakdown.map((cust, idx) => (
                <div
                  key={cust.customerName}
                  className="p-3 flex items-center justify-between hover:bg-slate-50/50 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{cust.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-700 block">
                      {formatCurrency(cust.totalSpent)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Items in Period Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            <span>Best Selling Fishing Gear in Period</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Ranked by units sold & revenue
          </span>
        </div>

        {summary.topItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No items were sold during the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Barcode</th>
                  <th className="py-2.5 px-4 text-center">Units Sold</th>
                  <th className="py-2.5 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.topItems.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.barcode}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {item.quantitySold}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-teal-700">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders matching period (FR22 audit list) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Detailed Orders in Period ({summary.orders.length})
          </h3>
          <span className="text-xs text-slate-400">
            {formatShortDate(startDate)} → {formatShortDate(endDate)}
          </span>
        </div>

        {summary.orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders found within this date range.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {summary.orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="text-slate-400">• {formatShortDate(ord.createdAt)}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ord.status === 'Order registered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Customer: <strong>{ord.customerName}</strong> ({ord.items.length} items)
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-teal-700">
                    {formatCurrency(ord.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
