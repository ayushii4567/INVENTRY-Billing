import express from "express";
import {
  findPurchases,
  findPurchaseById,
  createPurchaseVoucher
} from "./purchase.repository.js";
import { findSupplierById } from "../suppliers/supplier.repository.js";
import { verifyToken, requireRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/purchases
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", supplierId = "", paymentStatus = "ALL" } = req.query;
    const result = await findPurchases({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      supplierId,
      paymentStatus
    });
    return res.json({ success: true, data: result.purchases, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    console.error("GET /api/purchases error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch purchases" });
  }
});

// GET /api/purchases/:id
router.get("/:id", async (req, res) => {
  try {
    const purchase = await findPurchaseById(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase voucher not found" });
    return res.json({ success: true, data: purchase });
  } catch (err) {
    console.error("GET /api/purchases/:id error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch purchase details" });
  }
});

// POST /api/purchases (Create F9 Purchase Voucher)
router.post("/", verifyToken, requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"), async (req, res) => {
  try {
    let { supplierId, supplierName, supplierCode, supplierGstin, supplierInvoiceNumber, supplierInvoiceNo, items } = req.body;
    supplierInvoiceNumber = supplierInvoiceNumber || supplierInvoiceNo;

    if (!supplierId) {
      return res.status(400).json({ success: false, message: "Supplier ID is required" });
    }

    if (!supplierName) {
      const sup = await findSupplierById(supplierId);
      if (sup) {
        supplierName = sup.supplierName;
        supplierCode = sup.supplierCode || supplierCode;
        supplierGstin = sup.gstin || supplierGstin;
      } else {
        supplierName = "Supplier";
      }
    }

    if (!supplierInvoiceNumber || !supplierInvoiceNumber.trim()) {
      return res.status(400).json({ success: false, message: "Supplier invoice number is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one item is required" });
    }

    const created = await createPurchaseVoucher({
      ...req.body,
      supplierName,
      supplierCode,
      supplierGstin
    }, req.user || { name: "Owner" });
    return res.status(201).json({
      success: true,
      message: `Purchase Voucher ${created.purchaseNumber} recorded. Stock updated successfully.`,
      data: created
    });
  } catch (err) {
    console.error("POST /api/purchases error:", err);
    const status = err.message?.includes("Duplicate") ? 409 : 500;
    return res.status(status).json({ success: false, message: err.message || "Failed to create purchase voucher" });
  }
});

export default router;
