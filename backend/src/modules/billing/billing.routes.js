import express from "express";
import {
  getBills,
  getBillById,
  generateBill,
  createDirectBill,
  lockBill,
  cancelBill,
  getOpenBillsForCustomer
} from "./billing.controller.js";
import { verifyToken, requireRole } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// List invoices (Salesman scoped, Owner/Admin/Finance/SalesMgr view all)
router.get("/", getBills);

// Direct F8 Sales Invoice Creation (Owner, Admin, Finance, Sales Manager)
router.post(
  "/",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  createDirectBill
);
router.post(
  "/direct",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  createDirectBill
);

// Open invoices for a customer (for payment mapping)
router.get("/customer/:customerId/open", getOpenBillsForCustomer);

// Single invoice details
router.get("/:id", getBillById);

// Generate invoice from confirmed order (Owner, Admin, Finance, Sales Manager)
router.post(
  "/generate/:orderId",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"),
  generateBill
);

// Lock invoice (Owner, Admin, Finance)
router.patch(
  "/:id/lock",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  lockBill
);
router.post(
  "/:id/lock",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  lockBill
);

// Cancel invoice (Owner, Admin, Finance)
router.patch(
  "/:id/cancel",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  cancelBill
);
router.post(
  "/:id/cancel",
  requireRole("SUPER_ADMIN", "ADMIN", "FINANCE"),
  cancelBill
);

export default router;
