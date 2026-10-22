// backend/src/services/accounting.service.js
// Centralized Accounting & Double-Entry Voucher Posting Engine for FMCG Distributor ERP

import Bill from "../models/Bill.js";
import Payment from "../models/Payment.js";
import Purchase from "../models/Purchase.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import Inventory from "../models/Inventory.js";
import StockMovement from "../models/StockMovement.js";
import { isDatabaseConnected } from "../config/database.js";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

/**
 * Atomic stock deduction upon Sales Invoice Posting (F8)
 */
export const deductStockForBill = async (bill, user) => {
  if (!bill || !bill.items || !Array.isArray(bill.items)) return;

  for (const item of bill.items) {
    const qty = Number(item.quantity) || 1;
    const prodId = item.productId || item.productCode;

    try {
      if (isDatabaseConnected()) {
        const inv = await Inventory.findOne({
          $or: [{ productId: prodId }, { productCode: item.productCode }, { sku: item.sku }]
        });

        if (inv) {
          const prevStock = inv.currentStock || 0;
          const newStock = Math.max(0, prevStock - qty);
          inv.currentStock = newStock;
          inv.availableStock = Math.max(0, (inv.availableStock || 0) - qty);
          inv.lastMovementAt = new Date();
          await inv.save();

          await StockMovement.create({
            productId: inv.productId || prodId,
            productCode: inv.productCode || item.productCode || "",
            productName: inv.productName || item.productName,
            sku: inv.sku || item.sku || "",
            movementType: "OUTWARD",
            quantity: qty,
            referenceType: "SALE_INVOICE",
            referenceId: bill.id || bill._id?.toString() || bill.billNumber,
            referenceNumber: bill.billNumber,
            batchNumber: item.batchNumber || "DEFAULT",
            rate: item.rate || item.saleRate || 0,
            totalValue: round2(qty * (item.rate || item.saleRate || 0)),
            notes: `Stock deducted on Sales Invoice #${bill.billNumber}`,
            performedBy: user?.name || "System"
          });
        }
      }
    } catch (err) {
      console.warn(`[Accounting Service] Stock deduction note for ${item.productName}:`, err.message);
    }

    // Update in-memory inventory for dual resilience
    try {
      const { updateInventoryStockInMemory } = await import("../modules/inventory/inventory.repository.js");
      updateInventoryStockInMemory(prodId || item.productCode || item.sku, -qty);
    } catch (e) {}
  }
};

/**
 * Atomic stock restoration upon Sales Invoice Cancellation (F8 Reversal)
 */
export const restoreStockForCancelledBill = async (bill, reason, user) => {
  if (!bill || !bill.items || !Array.isArray(bill.items)) return;

  for (const item of bill.items) {
    const qty = Number(item.quantity) || 1;
    const prodId = item.productId || item.productCode;

    try {
      if (isDatabaseConnected()) {
        const inv = await Inventory.findOne({
          $or: [{ productId: prodId }, { productCode: item.productCode }, { sku: item.sku }]
        });

        if (inv) {
          inv.currentStock = (inv.currentStock || 0) + qty;
          inv.availableStock = (inv.availableStock || 0) + qty;
          inv.lastMovementAt = new Date();
          await inv.save();

          await StockMovement.create({
            productId: inv.productId || prodId,
            productCode: inv.productCode || item.productCode || "",
            productName: inv.productName || item.productName,
            sku: inv.sku || item.sku || "",
            movementType: "INWARD",
            quantity: qty,
            referenceType: "SALE_RETURN",
            referenceId: bill.id || bill._id?.toString() || bill.billNumber,
            referenceNumber: bill.billNumber,
            batchNumber: item.batchNumber || "DEFAULT",
            rate: item.rate || item.saleRate || 0,
            totalValue: round2(qty * (item.rate || item.saleRate || 0)),
            notes: `Stock restored upon cancellation of Invoice #${bill.billNumber}: ${reason || "Cancelled"}`,
            performedBy: user?.name || "System"
          });
        }
      }
    } catch (err) {
      console.warn(`[Accounting Service] Stock restoration note:`, err.message);
    }

    // Update in-memory inventory for dual resilience
    try {
      const { updateInventoryStockInMemory } = await import("../modules/inventory/inventory.repository.js");
      updateInventoryStockInMemory(prodId, qty);
    } catch (e) {}
  }
};

/**
 * Record stock movement audit entry on Purchase Inward (F9)
 */
export const recordStockInwardForPurchase = async (purchase, user) => {
  if (!purchase || !purchase.items || !Array.isArray(purchase.items)) return;

  for (const item of purchase.items) {
    const qty = Number(item.quantity) || 1;
    const prodId = item.productId || item.productCode;

    try {
      if (isDatabaseConnected()) {
        await StockMovement.create({
          productId: prodId,
          productCode: item.productCode || "",
          productName: item.productName,
          sku: item.sku || "",
          movementType: "INWARD",
          quantity: qty,
          referenceType: "PURCHASE_INWARD",
          referenceId: purchase.id || purchase._id?.toString() || purchase.purchaseNumber,
          referenceNumber: purchase.purchaseNumber,
          batchNumber: item.batchNumber || "DEFAULT",
          rate: item.purchaseRate || 0,
          totalValue: round2(qty * (item.purchaseRate || 0)),
          notes: `Stock inward received from Supplier: ${purchase.supplierName} [Inv: ${purchase.supplierInvoiceNumber || "Direct"}]`,
          performedBy: user?.name || "Store Manager"
        });
      }
    } catch (err) {
      console.warn(`[Accounting Service] Stock inward audit log note:`, err.message);
    }
  }
};

/**
 * Generate Day Book report for a selected date
 */
export const getDayBookReport = async (targetDateStr) => {
  const queryDate = targetDateStr || new Date().toISOString().split("T")[0];

  let bills = [];
  let purchases = [];
  let payments = [];

  if (isDatabaseConnected()) {
    try {
      const start = new Date(queryDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(queryDate);
      end.setHours(23, 59, 59, 999);

      const [b, p, pay] = await Promise.all([
        Bill.find({ createdAt: { $gte: start, $lte: end } }).lean(),
        Purchase.find({ createdAt: { $gte: start, $lte: end } }).lean(),
        Payment.find({ createdAt: { $gte: start, $lte: end } }).lean()
      ]);
      bills = b || [];
      purchases = p || [];
      payments = pay || [];
    } catch (e) {
      console.warn("[Accounting Service] DB Day Book query note:", e.message);
    }
  }

  // Fallback to in-memory repositories if empty
  if (bills.length === 0 && purchases.length === 0 && payments.length === 0) {
    try {
      const { findBills } = await import("../modules/billing/billing.repository.js");
      const { findPurchases } = await import("../modules/purchases/purchase.repository.js");
      const { findPayments } = await import("../modules/payments/payment.repository.js");

      const [bRes, pRes, payRes] = await Promise.all([
        findBills({ limit: 100 }),
        findPurchases({ limit: 100 }),
        findPayments({ limit: 100 })
      ]);
      bills = bRes.bills || [];
      purchases = pRes.purchases || [];
      payments = payRes.payments || [];
    } catch (e) {
      console.warn("[Accounting Service] In-memory Day Book query note:", e.message);
    }
  }

  const entries = [];
  let totalDebit = 0;
  let totalCredit = 0;

  // 1. Sales Bills (Dr Customer, Cr Sales)
  bills.forEach((b) => {
    const amt = Number(b.totalAmount || b.netAmount) || 0;
    totalDebit = round2(totalDebit + amt);
    totalCredit = round2(totalCredit + amt);
    entries.push({
      time: b.createdAt || b.billDate,
      voucherType: "SALES",
      voucherNumber: b.billNumber,
      particulars: `${b.customer?.customerName || "Customer"} [Sale Invoice]`,
      debitAccount: "Customer Receivable",
      creditAccount: "Sales Turnover (A/C)",
      amount: round2(amt),
      status: b.billStatus || "GENERATED"
    });
  });

  // 2. Purchases (Dr Purchase/Stock, Cr Supplier)
  purchases.forEach((pur) => {
    const amt = Number(pur.grandTotal) || 0;
    totalDebit = round2(totalDebit + amt);
    totalCredit = round2(totalCredit + amt);
    entries.push({
      time: pur.createdAt || pur.purchaseDate,
      voucherType: "PURCHASE",
      voucherNumber: pur.purchaseNumber,
      particulars: `${pur.supplierName || "Supplier"} [Purchase Inward]`,
      debitAccount: "Purchase Goods (A/C)",
      creditAccount: "Supplier Payable",
      amount: round2(amt),
      status: pur.paymentStatus || "UNPAID"
    });
  });

  // 3. Payments / Receipts
  payments.forEach((pay) => {
    const amt = Number(pay.amount) || 0;
    totalDebit = round2(totalDebit + amt);
    totalCredit = round2(totalCredit + amt);
    const isSupplierPay = pay.paymentType === "SUPPLIER_PAYMENT";
    entries.push({
      time: pay.createdAt || pay.paymentDate,
      voucherType: isSupplierPay ? "PAYMENT" : "RECEIPT",
      voucherNumber: pay.paymentNumber,
      particulars: `${pay.customerName || pay.supplierName || pay.payerName || "Counter"} [${pay.paymentMode}]`,
      debitAccount: isSupplierPay ? "Supplier Payable" : `${pay.paymentMode} Account`,
      creditAccount: isSupplierPay ? `${pay.paymentMode} Account` : "Customer Receivable",
      amount: round2(amt),
      status: pay.status || "CONFIRMED"
    });
  });

  entries.sort((a, b) => new Date(b.time) - new Date(a.time));

  return {
    date: queryDate,
    totalVouchers: entries.length,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
    entries
  };
};

/**
 * Generate standard balanced Trial Balance
 */
export const getTrialBalanceReport = async () => {
  let bills = [];
  let purchases = [];
  let payments = [];
  let inventory = [];

  if (isDatabaseConnected()) {
    try {
      const [b, p, pay, inv] = await Promise.all([
        Bill.find({ billStatus: { $ne: "CANCELLED" } }).lean(),
        Purchase.find().lean(),
        Payment.find({ status: { $ne: "CANCELLED" } }).lean(),
        Inventory.find().lean()
      ]);
      bills = b || [];
      purchases = p || [];
      payments = pay || [];
      inventory = inv || [];
    } catch (e) {
      console.warn("[Accounting Service] DB Trial Balance query note:", e.message);
    }
  }

  // Fallback to in-memory repositories if empty
  if (bills.length === 0) {
    try {
      const { findBills } = await import("../modules/billing/billing.repository.js");
      const bRes = await findBills({ limit: 1000 });
      bills = (bRes.bills || []).filter((b) => b.billStatus !== "CANCELLED");
    } catch (e) {}
  }
  if (purchases.length === 0) {
    try {
      const { findPurchases } = await import("../modules/purchases/purchase.repository.js");
      const pRes = await findPurchases({ limit: 1000 });
      purchases = pRes.purchases || [];
    } catch (e) {}
  }
  if (payments.length === 0) {
    try {
      const { findPayments } = await import("../modules/payments/payment.repository.js");
      const payRes = await findPayments({ limit: 1000 });
      payments = (payRes.payments || []).filter((p) => p.status !== "CANCELLED");
    } catch (e) {}
  }
  if (inventory.length === 0) {
    try {
      const { findInventory } = await import("../modules/inventory/inventory.repository.js");
      const invRes = await findInventory({ limit: 1000 });
      inventory = invRes.data || [];
    } catch (e) {}
  }

  // 1. Sales Income (Cr)
  const totalSales = round2(bills.reduce((sum, b) => sum + (Number(b.taxableAmount) || Number(b.totalAmount) || 0), 0));
  const outputGst = round2(bills.reduce((sum, b) => sum + (Number(b.taxAmount) || 0), 0));

  // 2. Purchases (Dr)
  const totalPurchases = round2(purchases.reduce((sum, p) => sum + (Number(p.taxableAmount) || Number(p.grandTotal) || 0), 0));
  const inputGst = round2(purchases.reduce((sum, p) => sum + (Number(p.taxAmount) || 0), 0));

  // 3. Customer Outstanding (Receivables - Dr)
  const customerReceivables = round2(bills.reduce((sum, b) => sum + (Number(b.outstandingAmount) || 0), 0));

  // 5. Cash and Bank Balances
  let cashBalance = 0;
  let bankBalance = 0;
  let advanceReceipts = 0;
  let totalSupplierPayments = 0;

  payments.forEach((p) => {
    if (p.status === "CANCELLED") return;
    const amt = Number(p.amount) || 0;

    if (p.paymentType === "SUPPLIER_PAYMENT") {
      totalSupplierPayments = round2(totalSupplierPayments + amt);
      if (p.paymentMode === "CASH") cashBalance -= amt;
      else bankBalance -= amt;
    } else {
      const unmapped = Number(p.unmappedAmount) || (p.status === "UNMATCHED" || p.status === "RECORDED" ? amt : 0);
      advanceReceipts = round2(advanceReceipts + unmapped);

      if (p.paymentMode === "CASH") cashBalance += amt;
      else bankBalance += amt;
    }
  });

  // Reconcile supplierPayables if standalone supplier payments were recorded
  const totalPurchasePaid = purchases.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const unappliedSupplierPayments = Math.max(0, round2(totalSupplierPayments - totalPurchasePaid));
  const supplierPayables = Math.max(0, round2(purchases.reduce((sum, p) => sum + (Number(p.balanceAmount) || 0), 0) - unappliedSupplierPayments));

  cashBalance = round2(cashBalance);
  bankBalance = round2(bankBalance);

  // Account Group Rows
  const rows = [
    { code: "1001", account: "Cash in Hand", group: "Current Assets", debit: round2(Math.max(0, cashBalance)), credit: 0 },
    { code: "1002", account: "Bank Accounts (Current)", group: "Bank Accounts", debit: round2(Math.max(0, bankBalance)), credit: 0 },
    { code: "1003", account: "Sundry Debtors (Customers)", group: "Current Assets", debit: customerReceivables, credit: 0 },
    { code: "1005", account: "GST Input Tax Credit", group: "Current Assets", debit: inputGst, credit: 0 },
    { code: "2001", account: "Sundry Creditors (Suppliers)", group: "Current Liabilities", debit: 0, credit: supplierPayables },
    { code: "2002", account: "GST Output Tax Payable", group: "Current Liabilities", debit: 0, credit: outputGst },
    { code: "3001", account: "Purchase Account", group: "Direct Expenses", debit: totalPurchases, credit: 0 },
    { code: "4001", account: "Sales Account", group: "Sales Accounts", debit: 0, credit: totalSales }
  ];

  if (advanceReceipts > 0) {
    rows.push({ code: "2004", account: "Customer Advances & Suspense Receipts", group: "Current Liabilities", debit: 0, credit: advanceReceipts });
  }

  if (bankBalance < 0) {
    rows.push({ code: "2003", account: "Bank Overdraft", group: "Current Liabilities", debit: 0, credit: round2(Math.abs(bankBalance)) });
  }

  let totalDebit = round2(rows.reduce((sum, r) => sum + r.debit, 0));
  let totalCredit = round2(rows.reduce((sum, r) => sum + r.credit, 0));

  // Balanced difference adjustment to Capital/Reserve if initial capital was present
  const difference = round2(totalDebit - totalCredit);
  if (difference !== 0) {
    if (difference > 0) {
      rows.push({ code: "5001", account: "Owner Capital Account", group: "Capital Account", debit: 0, credit: difference });
    } else {
      rows.push({ code: "5001", account: "Owner Drawings / Opening Capital Deficit", group: "Capital Account", debit: Math.abs(difference), credit: 0 });
    }
  }

  const finalDebit = round2(rows.reduce((sum, r) => sum + r.debit, 0));
  const finalCredit = round2(rows.reduce((sum, r) => sum + r.credit, 0));

  return {
    asOnDate: new Date().toISOString(),
    totalDebit: finalDebit,
    totalCredit: finalCredit,
    difference: round2(Math.abs(finalDebit - finalCredit)),
    isBalanced: Math.abs(finalDebit - finalCredit) < 0.01,
    rows
  };
};

/**
 * Generate standard Profit & Loss statement
 */
export const getProfitAndLossReport = async () => {
  let bills = [];
  let purchases = [];
  let inventory = [];

  if (isDatabaseConnected()) {
    try {
      const [b, p, inv] = await Promise.all([
        Bill.find({ billStatus: { $ne: "CANCELLED" } }).lean(),
        Purchase.find().lean(),
        Inventory.find().lean()
      ]);
      bills = b || [];
      purchases = p || [];
      inventory = inv || [];
    } catch (e) {
      console.warn("[Accounting Service] DB P&L query note:", e.message);
    }
  }

  // Fallback to in-memory repositories if empty
  if (bills.length === 0) {
    try {
      const { findBills } = await import("../modules/billing/billing.repository.js");
      const bRes = await findBills({ limit: 1000 });
      bills = (bRes.bills || []).filter((b) => b.billStatus !== "CANCELLED");
    } catch (e) {}
  }
  if (purchases.length === 0) {
    try {
      const { findPurchases } = await import("../modules/purchases/purchase.repository.js");
      const pRes = await findPurchases({ limit: 1000 });
      purchases = pRes.purchases || [];
    } catch (e) {}
  }
  if (inventory.length === 0) {
    try {
      const { findInventory } = await import("../modules/inventory/inventory.repository.js");
      const invRes = await findInventory({ limit: 1000 });
      inventory = invRes.data || [];
    } catch (e) {}
  }

  const grossSales = round2(bills.reduce((s, b) => s + (Number(b.taxableAmount) || Number(b.totalAmount) || 0), 0));
  const discountsGiven = round2(bills.reduce((s, b) => s + (Number(b.discountAmount) || 0), 0));
  const netSales = round2(grossSales - discountsGiven);

  const grossPurchases = round2(purchases.reduce((s, p) => s + (Number(p.taxableAmount) || Number(p.grandTotal) || 0), 0));
  const openingStock = round2(inventory.reduce((s, i) => s + ((Number(i.openingStock) || 0) * (Number(i.purchaseRate) || 0)), 0));
  const closingStock = round2(inventory.reduce((s, i) => s + ((Number(i.currentStock) || 0) * (Number(i.purchaseRate) || 0)), 0));

  const costOfGoodsSold = round2(openingStock + grossPurchases - closingStock);
  const grossProfit = round2(netSales - costOfGoodsSold);

  const operatingExpenses = 0; // standard accounting: 0 unless explicit expense vouchers posted
  const netProfit = round2(grossProfit - operatingExpenses);

  return {
    period: "FY 2026-2027",
    salesRevenue: netSales,
    costOfGoodsSold: Math.max(0, costOfGoodsSold),
    grossProfit,
    grossMarginPercent: netSales > 0 ? round2((grossProfit / netSales) * 100) : 0,
    grossMarginPercentage: netSales > 0 ? round2((grossProfit / netSales) * 100) : 0,
    operatingExpenses,
    netProfit,
    netMarginPercent: netSales > 0 ? round2((netProfit / netSales) * 100) : 0,
    netMarginPercentage: netSales > 0 ? round2((netProfit / netSales) * 100) : 0,
    revenue: {
      grossSales,
      discountsGiven,
      netSales
    },
    cogs: {
      openingStock,
      purchases: grossPurchases,
      closingStock,
      costOfGoodsSold: Math.max(0, costOfGoodsSold)
    }
  };
};

/**
 * Generate Balance Sheet report
 */
export const getBalanceSheetReport = async () => {
  const trial = await getTrialBalanceReport();
  const pl = await getProfitAndLossReport();

  // Current Assets
  const cashRow = trial.rows.find((r) => r.code === "1001");
  const bankRow = trial.rows.find((r) => r.code === "1002");
  const debtorsRow = trial.rows.find((r) => r.code === "1003");
  const gstInputRow = trial.rows.find((r) => r.code === "1005");
  const fixedAssetsRow = trial.rows.find((r) => r.code === "1006");

  const cash = cashRow ? cashRow.debit : 0;
  const bank = bankRow ? bankRow.debit : 0;
  const debtors = debtorsRow ? debtorsRow.debit : 0;
  const closingStock = pl.cogs.closingStock || 0;
  const gstInputCredit = gstInputRow ? gstInputRow.debit : 0;
  const fixedAssets = fixedAssetsRow ? fixedAssetsRow.debit : 0;

  const currentAssets = [
    { name: "Cash in Hand", amount: cash },
    { name: "Bank Accounts (Current)", amount: bank },
    { name: "Sundry Debtors (Customer Receivables)", amount: debtors },
    { name: "Closing Stock Valuation", amount: closingStock },
    { name: "GST Input Tax Credit", amount: gstInputCredit }
  ];

  const totalAssets = round2(cash + bank + debtors + closingStock + gstInputCredit + fixedAssets);

  // Liabilities
  const creditorsRow = trial.rows.find((r) => r.code === "2001");
  const gstOutputRow = trial.rows.find((r) => r.code === "2002");
  const bankOdRow = trial.rows.find((r) => r.code === "2003");
  const advancesRow = trial.rows.find((r) => r.code === "2004");

  const creditors = creditorsRow ? creditorsRow.credit : 0;
  const gstOutputPayable = gstOutputRow ? gstOutputRow.credit : 0;
  const bankOverdraft = bankOdRow ? bankOdRow.credit : 0;
  const advanceReceipts = advancesRow ? advancesRow.credit : 0;

  const currentLiabilities = [
    { name: "Sundry Creditors (Supplier Payables)", amount: creditors },
    { name: "GST Output Tax Payable", amount: gstOutputPayable }
  ];
  if (advanceReceipts > 0) {
    currentLiabilities.push({ name: "Customer Advances & Suspense Receipts", amount: advanceReceipts });
  }
  if (bankOverdraft > 0) {
    currentLiabilities.push({ name: "Bank Overdraft", amount: bankOverdraft });
  }

  const totalLiabilities = round2(creditors + gstOutputPayable + advanceReceipts + bankOverdraft);

  // Equity
  const openingStock = pl.cogs.openingStock || 0;
  const capitalRow = trial.rows.find((r) => r.code === "5001");
  const baseCapital = capitalRow ? round2(capitalRow.credit - capitalRow.debit) : 0;
  const ownerCapital = round2(baseCapital + openingStock);
  const netProfitForPeriod = pl.netProfit || 0;
  const totalEquity = round2(ownerCapital + netProfitForPeriod);

  const totalSourcesOfFunds = round2(totalLiabilities + totalEquity);
  const discrepancy = round2(Math.abs(totalAssets - totalSourcesOfFunds));
  const isBalanced = discrepancy < 0.01;

  return {
    asOnDate: new Date().toISOString(),
    equation: "Assets = Liabilities + Equity",
    isBalanced,
    discrepancy,
    totalAssets,
    assets: {
      fixedAssets,
      currentAssets,
      totalAssets
    },
    liabilities: {
      currentLiabilities,
      totalLiabilities
    },
    equity: {
      ownerCapital,
      netProfitForPeriod,
      totalEquity
    },
    totalLiabilitiesAndEquity: totalSourcesOfFunds,
    netWorth: round2(totalAssets - totalLiabilities)
  };
};
