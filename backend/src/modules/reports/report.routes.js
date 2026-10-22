// backend/src/modules/reports/report.routes.js

import express from "express";
import { reportController } from "./report.controller.js";
import { verifyToken, requireRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All report endpoints require valid JWT authentication
router.use(verifyToken);

// Executive Summary - Owner, Admin, Finance, Sales Manager
router.get(
  "/executive-summary",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  reportController.getExecutiveSummary
);

// Sales Analytics - Financial / Executive roles only
router.get(
  "/sales",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  reportController.getSalesAnalytics
);

// Collection Analytics - Financial / Executive roles only
router.get(
  "/collections",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  reportController.getCollectionAnalytics
);

// Outstanding & Receivables - Financial / Executive roles only
router.get(
  "/outstanding",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  reportController.getOutstandingReport
);

// Top Customers - Owner, Admin, Finance
router.get(
  "/top-customers",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  reportController.getTopCustomers
);

// Top Products - Owner, Admin, Finance, Sales Manager
router.get(
  "/top-products",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  reportController.getTopProducts
);

// Salesman Performance - Owner, Admin, Finance, Sales Manager
router.get(
  "/salesmen",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  reportController.getSalesmanPerformance
);

// Exception Summary - Owner, Admin, Finance
router.get(
  "/exceptions",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  reportController.getExceptionSummary
);

// ── TALLY FINANCIAL STATEMENTS ───────────────────────────────

// 1. Day Book
router.get(
  "/daybook",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  async (req, res) => {
    try {
      const { getDayBookReport } = await import("../../services/accounting.service.js");
      const report = await getDayBookReport(req.query.date);
      res.json({ success: true, data: report });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

// 2. Trial Balance
router.get(
  "/trial-balance",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  async (req, res) => {
    try {
      const { getTrialBalanceReport } = await import("../../services/accounting.service.js");
      const report = await getTrialBalanceReport();
      res.json({ success: true, data: report });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

// 3. Profit & Loss Account
router.get(
  "/profit-loss",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  async (req, res) => {
    try {
      const { getProfitAndLossReport } = await import("../../services/accounting.service.js");
      const report = await getProfitAndLossReport();
      res.json({ success: true, data: report });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

// 4. Balance Sheet
router.get(
  "/balance-sheet",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  async (req, res) => {
    try {
      const { getBalanceSheetReport } = await import("../../services/accounting.service.js");
      const report = await getBalanceSheetReport();
      res.json({ success: true, data: report });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

// 5. GST Sales & Tax Summary
router.get(
  "/gst-summary",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  async (req, res) => {
    try {
      const Bill = (await import("../../models/Bill.js")).default;
      const { isDatabaseConnected } = await import("../../config/database.js");
      let bills = [];
      if (isDatabaseConnected()) {
        bills = await Bill.find({ billStatus: { $ne: "CANCELLED" } }).lean();
      } else {
        const { findBills } = await import("../billing/billing.repository.js");
        bills = (await findBills({ limit: 1000 })).bills || [];
      }

      let taxableValue = 0;
      let totalTax = 0;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      bills.forEach((b) => {
        const tax = Number(b.taxAmount) || 0;
        const taxable = Number(b.taxableAmount) || Number(b.totalAmount) || 0;
        taxableValue += taxable;
        totalTax += tax;
        // CGST / SGST 50-50 split for intra-state FMCG
        cgst += Math.round((tax / 2) * 100) / 100;
        sgst += Math.round((tax / 2) * 100) / 100;
      });

      res.json({
        success: true,
        data: {
          period: "Current FY",
          totalInvoices: bills.length,
          taxableValue: Math.round(taxableValue * 100) / 100,
          totalTax: Math.round(totalTax * 100) / 100,
          cgst,
          sgst,
          igst,
          grandTotal: Math.round((taxableValue + totalTax) * 100) / 100
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;
