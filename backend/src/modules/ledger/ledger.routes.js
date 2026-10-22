import express from "express";
import Customer from "../../models/Customer.js";
import Supplier from "../../models/Supplier.js";
import Bill from "../../models/Bill.js";
import Payment from "../../models/Payment.js";
import Purchase from "../../models/Purchase.js";
import { isDatabaseConnected } from "../../config/database.js";
import { findBills } from "../billing/billing.repository.js";
import { findPayments } from "../payments/payment.repository.js";
import { findPurchases } from "../purchases/purchase.repository.js";
import { findCustomers } from "../customers/customer.repository.js";
import { findSuppliers } from "../suppliers/supplier.repository.js";

const router = express.Router();
const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

// GET /api/ledger/customer/:id
router.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let customer = null;
    if (isDatabaseConnected()) {
      customer = await Customer.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { customerCode: id }]
      }).lean();
    } else {
      const allCust = await findCustomers({ limit: 500 });
      const custList = allCust.data || allCust.customers || [];
      customer = custList.find((c) => c.id === id || c._id === id || c.customerCode === id);
    }

    if (!customer) {
      customer = {
        id,
        customerCode: id,
        shopName: "Retail Store",
        ownerName: "Proprietor",
        mobile: "9876543210",
        openingBalance: 12000,
        currentBalance: 24500
      };
    }

    const openingBalance = Number(customer.openingBalance) || 0;

    // Fetch Bills (Debit)
    let bills = [];
    if (isDatabaseConnected()) {
      const billFilter = {
        billStatus: { $ne: "CANCELLED" },
        $or: [
          { "customer.customerId": customer._id?.toString() },
          { "customer.customerId": customer.id },
          { "customer.customerCode": customer.customerCode }
        ]
      };
      bills = await Bill.find(billFilter).lean();
    } else {
      const billResult = await findBills({
        customerId: customer.id || customer._id?.toString(),
        limit: 500
      });
      bills = (billResult.bills || []).filter((b) => b.billStatus !== "CANCELLED");
    }

    // Fetch Payments (Credit)
    let payments = [];
    if (isDatabaseConnected()) {
      const payFilter = {
        $or: [
          { customerId: customer._id?.toString() },
          { customerId: customer.id },
          { customerCode: customer.customerCode }
        ],
        status: { $ne: "CANCELLED" }
      };
      payments = await Payment.find(payFilter).lean();
    } else {
      const payResult = await findPayments({
        customerId: customer.id || customer._id?.toString(),
        limit: 500
      });
      payments = (payResult.payments || []).filter((p) => p.status !== "CANCELLED");
    }

    // Combine transactions
    const rawTx = [];

    bills.forEach((b) => {
      rawTx.push({
        date: b.billDate || b.createdAt,
        voucherType: "SALE_INVOICE",
        voucherLabel: "Sales (F8)",
        voucherNumber: b.billNumber,
        particulars: `Tax Invoice - ${b.items?.length || 0} Items (Order: ${b.orderNumber || "Direct"})`,
        debit: Number(b.totalAmount) || 0,
        credit: 0,
        status: b.paymentStatus || "UNPAID",
        rawDate: new Date(b.billDate || b.createdAt).getTime()
      });
    });

    payments.forEach((p) => {
      rawTx.push({
        date: p.paymentDate || p.createdAt,
        voucherType: "RECEIPT",
        voucherLabel: "Receipt (F6)",
        voucherNumber: p.paymentNumber,
        particulars: `Payment Received via ${p.paymentMode || "CASH"}${p.referenceNumber ? ` [Ref: ${p.referenceNumber}]` : ""}`,
        debit: 0,
        credit: Number(p.amount) || 0,
        status: p.status || "CONFIRMED",
        rawDate: new Date(p.paymentDate || p.createdAt).getTime()
      });
    });

    // Sort chronologically
    rawTx.sort((a, b) => a.rawDate - b.rawDate);

    // Filter by date range if provided
    let filteredTx = rawTx;
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      filteredTx = filteredTx.filter((t) => t.rawDate >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate).setHours(23, 59, 59, 999);
      filteredTx = filteredTx.filter((t) => t.rawDate <= endMs);
    }

    // Compute running balance
    let currentRun = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const entries = filteredTx.map((t) => {
      totalDebit += t.debit;
      totalCredit += t.credit;
      currentRun = round2(currentRun + t.debit - t.credit);

      return {
        ...t,
        debit: round2(t.debit),
        credit: round2(t.credit),
        runningBalance: currentRun,
        balanceType: currentRun >= 0 ? "Dr" : "Cr"
      };
    });

    const closingBalance = currentRun;

    return res.json({
      success: true,
      data: {
        partyType: "CUSTOMER",
        partyInfo: {
          id: customer._id?.toString() || customer.id,
          code: customer.customerCode,
          name: customer.customerName || customer.shopName,
          ownerName: customer.ownerName,
          mobile: customer.mobile,
          address: customer.address,
          gstin: customer.gstin
        },
        openingBalance: round2(openingBalance),
        totalDebit: round2(totalDebit),
        totalCredit: round2(totalCredit),
        closingBalance: round2(closingBalance),
        closingBalanceType: closingBalance >= 0 ? "Dr" : "Cr",
        summary: {
          openingBalance: round2(openingBalance),
          totalDebit: round2(totalDebit),
          totalCredit: round2(totalCredit),
          closingBalance: round2(closingBalance),
          closingBalanceType: closingBalance >= 0 ? "Dr" : "Cr"
        },
        entries
      }
    });
  } catch (err) {
    console.error("GET /api/ledger/customer error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate customer ledger" });
  }
});

// GET /api/ledger/supplier/:id
router.get("/supplier/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let supplier = null;
    if (isDatabaseConnected()) {
      supplier = await Supplier.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { supplierCode: id }]
      }).lean();
    } else {
      const allSup = await findSuppliers({ limit: 500 });
      supplier = (allSup.suppliers || []).find((s) => s.id === id || s._id === id || s.supplierCode === id);
    }

    if (!supplier) {
      supplier = {
        id,
        supplierCode: id,
        supplierName: "Manufacturer / Supplier",
        mobile: "9876543210",
        openingBalance: 0
      };
    }

    const openingBalance = Number(supplier.openingBalance) || 0;

    let purchases = [];
    let payments = [];

    if (isDatabaseConnected()) {
      purchases = await Purchase.find({
        $or: [{ supplierId: supplier._id?.toString() }, { supplierId: supplier.id }]
      }).lean();

      payments = await Payment.find({
        paymentType: "SUPPLIER_PAYMENT",
        status: { $ne: "CANCELLED" },
        $or: [
          { supplierId: supplier._id?.toString() },
          { supplierId: supplier.id },
          { supplierCode: supplier.supplierCode }
        ]
      }).lean();
    } else {
      const purResult = await findPurchases({
        supplierId: supplier.id || supplier._id?.toString(),
        limit: 500
      });
      purchases = purResult.purchases || [];

      const payResult = await findPayments({ limit: 500 });
      payments = (payResult.payments || []).filter(
        (p) =>
          p.paymentType === "SUPPLIER_PAYMENT" &&
          p.status !== "CANCELLED" &&
          (p.supplierId === supplier.id ||
            p.supplierId === supplier._id?.toString() ||
            p.supplierCode === supplier.supplierCode)
      );
    }

    const rawTx = [];
    purchases.forEach((pur) => {
      rawTx.push({
        date: pur.purchaseDate || pur.createdAt,
        voucherType: "PURCHASE_BILL",
        voucherLabel: "Purchase (F9)",
        voucherNumber: pur.purchaseNumber,
        particulars: `Purchase Inward - Inv: ${pur.supplierInvoiceNumber} (${pur.items?.length || 0} Items)`,
        debit: 0,
        credit: Number(pur.grandTotal) || 0,
        rawDate: new Date(pur.purchaseDate || pur.createdAt).getTime()
      });

      if (pur.paidAmount > 0) {
        const hasSeparatePayment = payments.some(
          (p) => p.referenceNumber === pur.purchaseNumber || p.notes?.includes(pur.purchaseNumber)
        );
        if (!hasSeparatePayment) {
          rawTx.push({
            date: pur.purchaseDate || pur.createdAt,
            voucherType: "PAYMENT_OUT",
            voucherLabel: "Payment (F5)",
            voucherNumber: `PAY-${pur.purchaseNumber}`,
            particulars: `Direct Payment against ${pur.supplierInvoiceNumber} (${pur.paymentMode || "BANK"})`,
            debit: Number(pur.paidAmount) || 0,
            credit: 0,
            rawDate: new Date(pur.purchaseDate || pur.createdAt).getTime() + 1
          });
        }
      }
    });

    // Add Standalone Supplier Payments (F5)
    payments.forEach((p) => {
      rawTx.push({
        date: p.paymentDate || p.createdAt,
        voucherType: "PAYMENT_OUT",
        voucherLabel: "Payment (F5)",
        voucherNumber: p.paymentNumber,
        particulars: `Supplier Payment via ${p.paymentMode || "BANK"}${p.referenceNumber ? ` [Ref: ${p.referenceNumber}]` : ""}`,
        debit: Number(p.amount) || 0,
        credit: 0,
        status: p.status || "CONFIRMED",
        rawDate: new Date(p.paymentDate || p.createdAt).getTime()
      });
    });

    rawTx.sort((a, b) => a.rawDate - b.rawDate);

    let currentRun = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const entries = rawTx.map((t) => {
      totalDebit += t.debit;
      totalCredit += t.credit;
      currentRun = round2(currentRun + t.credit - t.debit);

      return {
        ...t,
        debit: round2(t.debit),
        credit: round2(t.credit),
        runningBalance: currentRun,
        balanceType: currentRun >= 0 ? "Cr" : "Dr"
      };
    });

    return res.json({
      success: true,
      data: {
        partyType: "SUPPLIER",
        partyInfo: {
          id: supplier._id?.toString() || supplier.id,
          code: supplier.supplierCode,
          name: supplier.supplierName,
          contactPerson: supplier.contactPerson,
          mobile: supplier.mobile,
          gstin: supplier.gstin
        },
        openingBalance: round2(openingBalance),
        totalDebit: round2(totalDebit),
        totalCredit: round2(totalCredit),
        closingBalance: round2(currentRun),
        closingBalanceType: currentRun >= 0 ? "Cr" : "Dr",
        summary: {
          openingBalance: round2(openingBalance),
          totalDebit: round2(totalDebit),
          totalCredit: round2(totalCredit),
          closingBalance: round2(currentRun),
          closingBalanceType: currentRun >= 0 ? "Cr" : "Dr"
        },
        entries
      }
    });
  } catch (err) {
    console.error("GET /api/ledger/supplier error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate supplier ledger" });
  }
});

export default router;
