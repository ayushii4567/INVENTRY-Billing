import express from "express";
import {
  getPayments,
  getPaymentById,
  getUnmatchedPayments,
  recordPayment,
  identifyCustomer,
  mapPayment,
  cancelPayment
} from "./payment.controller.js";
import { verifyToken, requireRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// List all payments (with filters, pagination, search, salesman scoped)
router.get("/", getPayments);

// Unmatched UPI suspense queue
router.get("/unmatched", requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"), getUnmatchedPayments);

// Single payment details
router.get("/:id", getPaymentById);

// Record payment entry (Cash, UPI, Cheque)
router.post("/", recordPayment);

// Record Supplier Payment Voucher (Tally F5)
router.post(
  "/supplier",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  async (req, res) => {
    try {
      const { supplierId, supplierName, amount, paymentMode, referenceNumber, purchaseId, notes } = req.body;
      if (!supplierId || !amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Supplier ID and valid payment amount are required." });
      }

      const { generatePaymentNumber, createPaymentRecord } = await import("./payment.repository.js");
      const paymentNumber = await generatePaymentNumber();

      const payData = {
        paymentNumber,
        paymentDate: new Date().toISOString(),
        paymentType: "SUPPLIER_PAYMENT",
        supplierId,
        supplierName: supplierName || "Supplier",
        customerId: null,
        customerName: null,
        paymentMode: (paymentMode || "BANK_TRANSFER").toUpperCase(),
        amount: Number(amount),
        referenceNumber: referenceNumber || `SUP-REF-${Date.now()}`,
        status: "CONFIRMED",
        notes: notes || "Payment to Supplier (F5 Voucher)",
        createdBy: req.user?.name || "Owner"
      };

      const record = await createPaymentRecord(payData);

      // Reduce Supplier balance (Dr: Sundry Creditors reduces payable)
      try {
        const { findSupplierById, updateSupplierRecord } = await import("../suppliers/supplier.repository.js");
        const sup = await findSupplierById(supplierId);
        if (sup) {
          const newBal = Math.max(0, (Number(sup.currentBalance) || 0) - Number(amount));
          await updateSupplierRecord(supplierId, { currentBalance: newBal });
        }
      } catch (e) {
        console.warn("Supplier balance update note:", e.message);
      }

      // If specific purchase voucher allocated, update purchase balance
      if (purchaseId) {
        try {
          const Purchase = (await import("../../models/Purchase.js")).default;
          const { isDatabaseConnected } = await import("../../config/database.js");
          if (isDatabaseConnected()) {
            const pur = await Purchase.findById(purchaseId) || await Purchase.findOne({ purchaseNumber: purchaseId });
            if (pur) {
              pur.paidAmount = round2((pur.paidAmount || 0) + Number(amount));
              pur.balanceAmount = round2(Math.max(0, pur.grandTotal - pur.paidAmount));
              pur.paymentStatus = pur.balanceAmount === 0 ? "PAID" : "PARTIAL";
              await pur.save();
            }
          } else {
            const { findPurchases } = await import("../purchases/purchase.repository.js");
            const purRes = await findPurchases({ limit: 100 });
            const pur = (purRes.purchases || []).find((p) => p.id === purchaseId || p.purchaseNumber === purchaseId);
            if (pur) {
              pur.paidAmount = round2((pur.paidAmount || 0) + Number(amount));
              pur.balanceAmount = round2(Math.max(0, pur.grandTotal - pur.paidAmount));
              pur.paymentStatus = pur.balanceAmount === 0 ? "PAID" : "PARTIAL";
            }
          }
        } catch (e) {}
      }

      return res.status(201).json({
        success: true,
        message: `Supplier Payment Voucher ${paymentNumber} recorded successfully.`,
        data: record
      });
    } catch (err) {
      console.error("Supplier Payment Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to record supplier payment." });
    }
  }
);

// Identify customer for unmatched UPI payment
router.patch(
  "/:id/identify-customer",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  identifyCustomer
);

// Map payment to one or multiple invoices
router.patch(
  "/:id/map",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  mapPayment
);

// Cancel payment with reason
router.patch(
  "/:id/cancel",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  cancelPayment
);

export default router;
