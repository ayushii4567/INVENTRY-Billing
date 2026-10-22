import Purchase from "../../models/Purchase.js";
import Inventory from "../../models/Inventory.js";
import Product from "../../models/Product.js";
import Supplier from "../../models/Supplier.js";
import StockMovement from "../../models/StockMovement.js";
import { isDatabaseConnected } from "../../config/database.js";

let inMemoryPurchases = [
  {
    id: "pur-2026-000001",
    _id: "pur-2026-000001",
    purchaseNumber: "PUR-2026-000001",
    supplierInvoiceNumber: "INV-NES-2026-8941",
    purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    supplierId: "sup-001",
    supplierCode: "SUP-001",
    supplierName: "Nestlé India Limited",
    supplierGstin: "22AAACN0142D1Z8",
    items: [
      {
        productId: "prod-01",
        productCode: "NES-MAG-70G",
        productName: "Maggi 2-Minute Noodles 70g",
        sku: "NES-MAG-70G",
        unit: "PCS",
        quantity: 250,
        purchaseRate: 11.20,
        mrp: 14.00,
        saleRate: 12.50,
        discount: 2,
        discountAmount: 56.00,
        taxableAmount: 2744.00,
        taxRate: 5,
        taxAmount: 137.20,
        totalAmount: 2881.20
      },
      {
        productId: "prod-02",
        productCode: "NES-COF-50G",
        productName: "Nescafé Classic Coffee Jar 50g",
        sku: "NES-COF-50G",
        unit: "PCS",
        quantity: 120,
        purchaseRate: 142.00,
        mrp: 185.00,
        saleRate: 165.00,
        discount: 3,
        discountAmount: 511.20,
        taxableAmount: 16528.80,
        taxRate: 18,
        taxAmount: 2975.18,
        totalAmount: 19503.98
      }
    ],
    subtotal: 19272.80,
    discountAmount: 567.20,
    taxableAmount: 19272.80,
    taxAmount: 3112.38,
    roundOff: 0,
    grandTotal: 22385.18,
    paidAmount: 0,
    balanceAmount: 22385.18,
    paymentStatus: "UNPAID",
    paymentMode: "CREDIT",
    notes: "Primary depot replenishment order for Sadar & Model Town beats",
    receivedBy: "Store Manager",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let purchaseCounter = 1;
const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

export const getNextPurchaseNumber = async () => {
  purchaseCounter += 1;
  const year = new Date().getFullYear();
  return `PUR-${year}-${String(purchaseCounter).padStart(6, "0")}`;
};

export const findPurchases = async ({
  page = 1,
  limit = 50,
  search = "",
  supplierId = "",
  paymentStatus = "ALL"
} = {}) => {
  const skip = (page - 1) * limit;

  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (paymentStatus && paymentStatus !== "ALL") filter.paymentStatus = paymentStatus;
      if (supplierId) filter.supplierId = supplierId;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { purchaseNumber: regex },
          { supplierInvoiceNumber: regex },
          { supplierName: regex }
        ];
      }

      let [purchases, total] = await Promise.all([
        Purchase.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Purchase.countDocuments(filter)
      ]);

      if (purchases && purchases.length > 0) {
        return {
          purchases: purchases.map((p) => ({ ...p, id: p._id.toString() })),
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1
        };
      }
    } catch (e) {
      console.warn("MongoDB purchases query error, using memory:", e.message);
    }
  }

  let filtered = [...inMemoryPurchases];
  if (paymentStatus && paymentStatus !== "ALL") {
    filtered = filtered.filter((p) => p.paymentStatus === paymentStatus);
  }
  if (supplierId) {
    filtered = filtered.filter((p) => p.supplierId === supplierId);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.purchaseNumber.toLowerCase().includes(q) ||
        p.supplierInvoiceNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const paged = filtered.slice(skip, skip + limit);
  return {
    purchases: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1
  };
};

export const findPurchaseById = async (id) => {
  if (isDatabaseConnected()) {
    try {
      const p = await Purchase.findById(id).lean();
      if (p) return { ...p, id: p._id.toString() };
    } catch (e) {}
  }
  return inMemoryPurchases.find((p) => p.id === id || p._id === id || p.purchaseNumber === id) || null;
};

export const createPurchaseVoucher = async (data, user) => {
  // Prevent duplicate supplier invoice entry (idempotency & retry guard)
  if (data.supplierInvoiceNumber && data.supplierId) {
    if (isDatabaseConnected()) {
      const existing = await Purchase.findOne({
        supplierId: data.supplierId,
        supplierInvoiceNumber: data.supplierInvoiceNumber
      }).lean();
      if (existing) {
        throw new Error(`Duplicate purchase voucher: Supplier invoice '${data.supplierInvoiceNumber}' already exists for this supplier.`);
      }
    } else {
      const existing = inMemoryPurchases.find(
        (p) => p.supplierId === data.supplierId && p.supplierInvoiceNumber === data.supplierInvoiceNumber
      );
      if (existing) {
        throw new Error(`Duplicate purchase voucher: Supplier invoice '${data.supplierInvoiceNumber}' already exists for this supplier.`);
      }
    }
  }

  const purchaseNumber = await getNextPurchaseNumber();

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const processedItems = (data.items || []).map((item) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.purchaseRate) || 0;
    const discPct = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate !== undefined ? item.taxRate : 5);

    const gross = qty * rate;
    const discAmt = round2((gross * discPct) / 100);
    const taxable = round2(gross - discAmt);
    const taxAmt = round2((taxable * taxRate) / 100);
    const total = round2(taxable + taxAmt);

    subtotal += taxable;
    totalDiscount += discAmt;
    totalTax += taxAmt;

    return {
      productId: item.productId,
      productCode: item.productCode || "",
      productName: item.productName,
      sku: item.sku || "",
      unit: item.unit || "PCS",
      packSize: item.packSize || "",
      quantity: qty,
      purchaseRate: rate,
      mrp: Number(item.mrp) || rate,
      saleRate: Number(item.saleRate) || rate,
      discount: discPct,
      discountAmount: discAmt,
      taxableAmount: taxable,
      taxRate: taxRate,
      taxAmount: taxAmt,
      totalAmount: total
    };
  });

  const grandTotal = round2(subtotal + totalTax);
  const paidAmount = Number(data.paidAmount) || 0;
  const balanceAmount = round2(Math.max(0, grandTotal - paidAmount));
  const paymentStatus = balanceAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

  const purchaseDoc = {
    purchaseNumber,
    supplierInvoiceNumber: data.supplierInvoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
    purchaseDate: data.purchaseDate || new Date().toISOString(),
    supplierId: data.supplierId,
    supplierCode: data.supplierCode || "",
    supplierName: data.supplierName,
    supplierGstin: data.supplierGstin || "",
    items: processedItems,
    subtotal: round2(subtotal),
    discountAmount: round2(totalDiscount),
    taxableAmount: round2(subtotal),
    taxAmount: round2(totalTax),
    roundOff: 0,
    grandTotal,
    paidAmount,
    balanceAmount,
    paymentStatus,
    paymentMode: data.paymentMode || (paidAmount > 0 ? "BANK_TRANSFER" : "CREDIT"),
    notes: data.notes || "",
    receivedBy: user?.name || "Store Manager"
  };

  if (isDatabaseConnected()) {
    try {
      const savedPurchase = await Purchase.create(purchaseDoc);

      // Inward stock update for each item in both MongoDB and memory
      for (const item of processedItems) {
        try {
          let inv = await Inventory.findOne({
            $or: [
              { productId: item.productId },
              { productCode: item.productCode },
              { sku: item.sku }
            ]
          });

          if (inv) {
            const previousStock = inv.currentStock || 0;
            const newStock = previousStock + item.quantity;
            inv.currentStock = newStock;
            inv.availableStock = (inv.availableStock || 0) + item.quantity;
            inv.purchaseRate = item.purchaseRate;
            inv.lastMovementAt = new Date();
            await inv.save();
          } else {
            await Inventory.create({
              inventoryCode: `STK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
              productId: item.productId,
              productCode: item.productCode || item.sku,
              productName: item.productName,
              sku: item.sku || "",
              companyId: item.companyId || "GRP-TRADING",
              companyName: item.companyName || "Trading Goods",
              category: item.category || "Trading Goods",
              unit: item.unit || "PCS",
              currentStock: item.quantity,
              availableStock: item.quantity,
              purchaseRate: item.purchaseRate,
              saleRate: item.saleRate || 0,
              status: "IN_STOCK",
              lastMovementAt: new Date()
            });
          }
        } catch (e) {
          console.warn("[Purchase Repository] MongoDB inventory inward note:", e.message);
        }

        // Keep in-memory inventory in sync
        try {
          const { updateInventoryStockInMemory } = await import("../inventory/inventory.repository.js");
          updateInventoryStockInMemory(item.productId || item.productCode || item.sku, item.quantity, item.purchaseRate, {
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            sku: item.sku,
            unit: item.unit
          });
        } catch (e) {}
      }

      // Record inward stock movement audit log
      try {
        const { recordStockInwardForPurchase } = await import("../../services/accounting.service.js");
        await recordStockInwardForPurchase(savedPurchase, user);
      } catch (err) {
        console.warn("[Purchase Repository] Stock movement inward log note:", err.message);
      }

      // Update Supplier balance (Credit purchase increases supplier payable)
      if (balanceAmount > 0) {
        try {
          const { findSupplierById, updateSupplierRecord } = await import("../suppliers/supplier.repository.js");
          const sup = await findSupplierById(data.supplierId);
          if (sup) {
            const newBal = (Number(sup.currentBalance) || 0) + balanceAmount;
            await updateSupplierRecord(data.supplierId, { currentBalance: newBal });
          }
        } catch (e) {
          console.warn("Supplier balance update note:", e.message);
        }
      }

      return { ...savedPurchase.toObject(), id: savedPurchase._id.toString() };
    } catch (e) {
      console.warn("MongoDB create purchase failed, using memory:", e.message);
    }
  }

  // Memory fallback
  const savedPurchase = {
    ...purchaseDoc,
    id: `pur-${Date.now()}`,
    _id: `pur-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  inMemoryPurchases.unshift(savedPurchase);

  // Update in-memory inventory stock
  try {
    const { updateInventoryStockInMemory } = await import("../inventory/inventory.repository.js");
    for (const item of processedItems) {
      updateInventoryStockInMemory(item.productId, item.quantity, item.purchaseRate, {
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        sku: item.sku,
        unit: item.unit
      });
    }
  } catch (e) {
    console.warn("In-memory inventory update note:", e.message);
  }

  // Update Supplier balance in memory
  if (balanceAmount > 0) {
    try {
      const { findSupplierById, updateSupplierRecord } = await import("../suppliers/supplier.repository.js");
      const sup = await findSupplierById(data.supplierId);
      if (sup) {
        const newBal = (Number(sup.currentBalance) || 0) + balanceAmount;
        await updateSupplierRecord(data.supplierId, { currentBalance: newBal });
      }
    } catch (e) {
      console.warn("Supplier balance update note:", e.message);
    }
  }

  return savedPurchase;
};
