import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, SalesReportSummary } from '../types';
import { formatCurrency, formatDate, formatShortDate } from './discounts';

/**
 * Generates and downloads a PDF invoice / order receipt (FR18)
 */
export function generateOrderPDF(order: Order) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AQUATACKLE CRM', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Commercial Order Specification & Dispatch Document', 14, 21);

  // Status Badge in Header
  const statusColor = order.status === 'Order registered' ? [16, 185, 129] : [245, 158, 11]; // green or amber
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 55, 9, 41, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(order.status.toUpperCase(), pageWidth - 34.5, 15.5, { align: 'center' });

  // Metadata Grid
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(10);

  // Column 1: Order Details
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER IDENTIFICATION', 14, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Order Number: ${order.orderNumber}`, 14, 44);
  doc.text(`Date Created: ${formatDate(order.createdAt)}`, 14, 49);
  if (order.registeredAt) {
    doc.text(`Registered At: ${formatDate(order.registeredAt)}`, 14, 54);
  }
  doc.text(`Created By: Seller Field Terminal`, 14, order.registeredAt ? 59 : 54);

  // Column 2: Customer Details (FR09: customer name)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER / STORE INFORMATION', 110, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Customer Name: ${order.customerName}`, 110, 44);
  doc.text(`Destination: Fishing Retail / Storefront`, 110, 49);
  if (order.notes) {
    doc.text(`Order Notes: ${order.notes}`, 110, 54);
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 64, pageWidth - 14, 64);

  // Table of Items (FR10, FR11, FR12, FR13, FR14, FR15)
  const tableRows = order.items.map((item, idx) => {
    let discountStr = 'None';
    if (item.discounts && item.discounts.length > 0) {
      discountStr = item.discounts.map((d) => `-${d}%`).join(' -> ');
    }

    return [
      String(idx + 1),
      `${item.name}\n[${item.category}]`,
      item.barcode,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      discountStr,
      formatCurrency(item.finalUnitPrice),
      formatCurrency(item.totalPrice),
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [
      [
        '#',
        'Item Description',
        'Barcode',
        'Qty',
        'Unit Price',
        'Compound Discounts',
        'Final Unit',
        'Item Total',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 30, font: 'courier', fontSize: 7.5 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 26, halign: 'center', textColor: [220, 38, 38] },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Calculate final Y position after table
  const lastTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
  let finalY = lastTable ? lastTable.finalY + 8 : 170;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // Summary Totals Box (FR16)
  const totalsBoxX = pageWidth - 90;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsBoxX, finalY, 76, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal (Gross):', totalsBoxX + 4, finalY + 7);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(order.subtotal), totalsBoxX + 72, finalY + 7, { align: 'right' });

  doc.setTextColor(220, 38, 38);
  doc.text('Total Discounts Savings:', totalsBoxX + 4, finalY + 14);
  doc.text(`-${formatCurrency(order.totalDiscountAmount)}`, totalsBoxX + 72, finalY + 14, {
    align: 'right',
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(totalsBoxX + 4, finalY + 18, totalsBoxX + 72, finalY + 18);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Order Total:', totalsBoxX + 4, finalY + 26);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text(formatCurrency(order.totalPrice), totalsBoxX + 72, finalY + 26, { align: 'right' });

  // Signatures section
  const signY = finalY + 44;
  if (signY < 275) {
    doc.setDrawColor(148, 163, 184);
    doc.line(14, signY, 70, signY);
    doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Seller Signature / Dispatch Confirmation', 14, signY + 4);
    doc.text('Customer Acceptance Signature', pageWidth - 70, signY + 4);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by AquaTackle Fishing CRM System • Synchronized Terminal', 14, 287);
  doc.text(`Page 1 of 1`, pageWidth - 14, 287, { align: 'right' });

  // Save PDF file
  const filename = `${order.customerName.replace(/[^a-zA-Z0-9]/g, '_')}_${order.orderNumber}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads a Sales Report PDF (FR20, FR21, FR22)
 */
export function generateSalesReportPDF(summary: SalesReportSummary) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('AQUATACKLE CRM - SALES REPORT', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Computer Management Terminal • Generated on ${formatDate(new Date().toISOString())}`, 14, 20);

  // Period Badge
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTING PERIOD: ${formatShortDate(summary.startDate)} TO ${formatShortDate(summary.endDate)}`, 14, 34);

  // KPI Cards in PDF
  const cardWidth = 42;
  const cardHeight = 18;
  const startX = 14;
  const cardY = 38;

  const kpis = [
    { label: 'Total Sales Count', val: String(summary.totalSalesCount), color: [15, 23, 42] },
    { label: 'Total Revenue', val: formatCurrency(summary.totalRevenue), color: [13, 148, 136] },
    { label: 'Avg Order Value', val: formatCurrency(summary.averageOrderValue), color: [79, 70, 229] },
    { label: 'Registered Orders', val: `${summary.registeredCount} (${summary.pendingCount} pend)`, color: [16, 185, 129] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, cardY + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + 3, cardY + 12);
  });

  // Table of Orders in Period (FR22)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ORDERS IN SELECTED PERIOD', 14, 64);

  const orderRows = summary.orders.map((o) => [
    o.orderNumber,
    formatShortDate(o.createdAt),
    o.customerName,
    String(o.items.length) + ' items',
    formatCurrency(o.totalPrice),
    o.status,
  ]);

  autoTable(doc, {
    startY: 67,
    head: [['Order #', 'Date', 'Customer', 'Items Count', 'Net Total', 'Status']],
    body: orderRows.length > 0 ? orderRows : [['No orders found in this period', '', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
  });

  // Table of Top Selling Items
  const lastTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
  let nextY = lastTable ? lastTable.finalY + 8 : 140;

  if (nextY > 220) {
    doc.addPage();
    nextY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BEST SELLING FISHING ITEMS IN PERIOD', 14, nextY);

  const itemRows = summary.topItems.slice(0, 8).map((it) => [
    it.name,
    it.category,
    it.barcode,
    String(it.quantitySold),
    formatCurrency(it.totalRevenue),
  ]);

  autoTable(doc, {
    startY: nextY + 3,
    head: [['Item Name', 'Category', 'Barcode', 'Units Sold', 'Total Revenue']],
    body: itemRows.length > 0 ? itemRows : [['No item sales data', '', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
  });

  const filename = `SalesReport_${summary.startDate}_to_${summary.endDate}.pdf`;
  doc.save(filename);
}
