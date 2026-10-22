import Inventory from "../../models/Inventory.js";
import StockMovement from "../../models/StockMovement.js";

const computeStatus = (currentStock, minimumStock) => {
  const cur = Number(currentStock) || 0;
  const min = Number(minimumStock) || 0;
  if (cur <= 0) return "OUT_OF_STOCK";
  if (cur <= min) return "LOW_STOCK";
  return "IN_STOCK";
};

import { findActiveProducts } from "../products/product.repository.js";

// Clean in-memory inventory & movement collections
export let inMemoryInventory = [];
export let inMemoryStockMovements = [];
let movementCounter = 0;

export const updateInventoryStockInMemory = (productIdOrCode, deltaQty, rate = null, itemMeta = {}) => {
  let inv = inMemoryInventory.find(
    (i) =>
      i.productId === productIdOrCode ||
      i.productCode === productIdOrCode ||
      i.sku === productIdOrCode ||
      (itemMeta.sku && i.sku === itemMeta.sku) ||
      (itemMeta.productCode && i.productCode === itemMeta.productCode)
  );

  if (!inv) {
    inv = {
      id: `inv-${productIdOrCode}`,
      inventoryCode: `STK-${Date.now().toString().slice(-6)}`,
      productId: itemMeta.productId || productIdOrCode,
      productCode: itemMeta.productCode || productIdOrCode,
      productName: itemMeta.productName || productIdOrCode,
      sku: itemMeta.sku || productIdOrCode,
      category: itemMeta.category || "Trading Goods",
      companyName: itemMeta.companyName || "Trading Goods",
      unit: itemMeta.unit || "PCS",
      currentStock: 0,
      reservedStock: 0,
      availableStock: 0,
      minimumStock: 10,
      status: "IN_STOCK",
      purchaseRate: rate || 0,
      saleRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryInventory.push(inv);
  } else {
    if (itemMeta.sku) inv.sku = itemMeta.sku;
    if (itemMeta.productName) inv.productName = itemMeta.productName;
    if (itemMeta.productCode) inv.productCode = itemMeta.productCode;
  }

  const prev = inv.currentStock || 0;
  const updated = Math.max(0, prev + deltaQty);
  inv.currentStock = updated;
  inv.availableStock = Math.max(0, (inv.availableStock || 0) + deltaQty);
  if (rate !== null) inv.purchaseRate = rate;
  inv.status = computeStatus(updated, inv.minimumStock);
  inv.lastMovementAt = new Date().toISOString();
  return inv;
};

export const syncProductsToInventory = async () => {
  try {
    const products = await findActiveProducts();
    for (const prod of products) {
      const exists = inMemoryInventory.find(
        (inv) =>
          inv.productId === prod.id ||
          inv.productId === prod._id?.toString() ||
          inv.productCode === prod.productCode ||
          (prod.sku && inv.sku === prod.sku)
      );
      if (exists) {
        if (!exists.purchaseRate && prod.purchaseRate) exists.purchaseRate = prod.purchaseRate;
        if (!exists.saleRate && prod.saleRate) exists.saleRate = prod.saleRate;
        if (prod.productName) exists.productName = prod.productName;
        if (prod.sku) exists.sku = prod.sku;
        if (prod.productCode) exists.productCode = prod.productCode;
        continue;
      }

      if (!exists) {
        const codeSuffix = prod.productCode ? prod.productCode.replace("PRD-", "") : String(inMemoryInventory.length + 1).padStart(6, "0");
        inMemoryInventory.push({
          id: `inv-${prod.id}`,
          inventoryCode: `STK-${codeSuffix}`,
          productId: prod.id,
          productCode: prod.productCode,
          productName: prod.productName,
          sku: prod.sku,
          companyId: prod.companyId,
          companyName: prod.company || prod.companyName,
          category: prod.category,
          unit: prod.unit,
          packSize: prod.packSize,
          mrp: prod.mrp || 0,
          saleRate: prod.saleRate || 0,
          purchaseRate: prod.purchaseRate || 0,
          openingStock: 0,
          currentStock: 0,
          reservedStock: 0,
          availableStock: 0,
          minimumStock: prod.minimumStock || 10,
          status: "OUT_OF_STOCK",
          location: "Warehouse Central",
          batchTracking: Boolean(prod.batchTracking),
          expiryTracking: Boolean(prod.expiryTracking),
          createdAt: prod.createdAt || new Date().toISOString(),
          updatedAt: prod.updatedAt || new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error("Error syncing products to inventory:", err);
  }
};

export const getNextMovementNumber = async () => {
  movementCounter += 1;
  return `MV-2026-${String(movementCounter).padStart(6, "0")}`;
};

export const findInventory = async (query = {}, pagination = {}) => {
  await syncProductsToInventory();
  const page = Math.max(1, parseInt(pagination.page || query.page, 10) || 1);
  const limit = Math.max(1, parseInt(pagination.limit || query.limit, 10) || 10);

  let filtered = [...inMemoryInventory];

  if (query.search) {
    const s = query.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.productName.toLowerCase().includes(s) ||
        item.productCode.toLowerCase().includes(s) ||
        (item.sku && item.sku.toLowerCase().includes(s)) ||
        item.companyName.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s)
    );
  }

  if (query.companyId && query.companyId !== "ALL") {
    filtered = filtered.filter((item) => item.companyId === query.companyId);
  }

  if (query.category && query.category !== "ALL") {
    filtered = filtered.filter((item) => item.category === query.category);
  }

  if (query.status && query.status !== "ALL") {
    filtered = filtered.filter((item) => item.status === query.status);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    total,
    page,
    totalPages,
    limit
  };
};

export const findInventoryById = async (id) => {
  await syncProductsToInventory();
  const item = inMemoryInventory.find((inv) => inv.id === id || inv._id === id);
  if (!item) return null;

  // Retrieve recent movements for this inventory item
  const movements = inMemoryStockMovements
    .filter((mv) => mv.inventoryId === item.id || mv.productId === item.productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return {
    ...item,
    recentMovements: movements
  };
};

export const findInventoryByProductId = async (productId) => {
  await syncProductsToInventory();
  return inMemoryInventory.find((inv) => inv.productId === productId || inv.productCode === productId) || null;
};

export const getInventoryDashboardSummary = async () => {
  await syncProductsToInventory();
  const totalProducts = inMemoryInventory.length;
  let totalStockUnits = 0;
  let stockValue = 0;
  let inStockProducts = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  const lowStockAlerts = [];

  inMemoryInventory.forEach((item) => {
    const cur = item.currentStock || 0;
    totalStockUnits += cur;
    stockValue += cur * (item.saleRate || item.mrp || 0);

    if (item.status === "OUT_OF_STOCK" || cur <= 0) {
      outOfStockProducts += 1;
      lowStockAlerts.push({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        companyName: item.companyName,
        currentStock: cur,
        availableStock: item.availableStock || 0,
        minimumStock: item.minimumStock,
        status: "OUT_OF_STOCK",
        severity: "CRITICAL",
        deficit: Math.max(0, item.minimumStock - cur)
      });
    } else if (item.status === "LOW_STOCK" || cur <= item.minimumStock) {
      lowStockProducts += 1;
      lowStockAlerts.push({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        companyName: item.companyName,
        currentStock: cur,
        availableStock: item.availableStock || 0,
        minimumStock: item.minimumStock,
        status: "LOW_STOCK",
        severity: "WARNING",
        deficit: Math.max(0, item.minimumStock - cur)
      });
    } else {
      inStockProducts += 1;
    }
  });

  return {
    totalProducts,
    totalStockUnits,
    stockValue: Math.round(stockValue * 100) / 100,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
    lowStockAlerts
  };
};

export const adjustStockRecord = async (inventoryId, { adjustmentType, quantity, reason }, user) => {
  const idx = inMemoryInventory.findIndex((inv) => inv.id === inventoryId || inv._id === inventoryId);
  if (idx === -1) {
    throw new Error("Inventory record not found.");
  }

  const target = inMemoryInventory[idx];
  const qty = parseInt(quantity, 10);
  const prevStock = target.currentStock || 0;
  let newStock = prevStock;

  if (adjustmentType === "ADJUSTMENT_IN") {
    newStock = prevStock + qty;
  } else if (adjustmentType === "ADJUSTMENT_OUT") {
    if (prevStock < qty) {
      throw new Error(`Cannot adjust out ${qty} units. Current stock is only ${prevStock} units.`);
    }
    newStock = prevStock - qty;
  } else {
    throw new Error("Invalid adjustment type. Must be ADJUSTMENT_IN or ADJUSTMENT_OUT.");
  }

  const newStatus = computeStatus(newStock, target.minimumStock);
  const now = new Date().toISOString();
  const nextMvNum = await getNextMovementNumber();

  // Create StockMovement record
  const movement = {
    id: `mv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    movementNumber: nextMvNum,
    inventoryId: target.id,
    productId: target.productId,
    productCode: target.productCode,
    productName: target.productName,
    movementType: adjustmentType,
    quantity: qty,
    previousStock: prevStock,
    newStock: newStock,
    referenceType: "MANUAL_ADJUSTMENT",
    referenceId: `ADJ-${Date.now()}`,
    reason: reason.trim(),
    performedBy: `${user.name} (${user.role})`,
    createdAt: now
  };

  inMemoryStockMovements.unshift(movement);

  // Update Inventory item
  const updatedItem = {
    ...target,
    openingStock: (Number(target.openingStock || 0) === 0 && reason.toLowerCase().includes("opening")) ? qty : (target.openingStock || 0),
    currentStock: newStock,
    availableStock: Math.max(0, newStock - (target.reservedStock || 0)),
    status: newStatus,
    lastMovementAt: now,
    updatedBy: user.name,
    updatedAt: now
  };

  inMemoryInventory[idx] = updatedItem;

  console.log(
    `[AUDIT] Product: ${target.productName} | Action: ${adjustmentType} | Quantity: ${qty} | Previous Stock: ${prevStock} | New Stock: ${newStock} | Reason: "${reason}" | By: ${user.name} [${user.role}]`
  );

  return {
    inventory: updatedItem,
    movement
  };
};

export const getStockMovements = async (inventoryId, pagination = { page: 1, limit: 10 }) => {
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.max(1, parseInt(pagination.limit, 10) || 10);

  let movements = [...inMemoryStockMovements];

  if (inventoryId) {
    movements = movements.filter(
      (mv) => mv.inventoryId === inventoryId || mv.productId === inventoryId
    );
  }

  movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = movements.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = movements.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    total,
    page,
    totalPages,
    limit
  };
};

/**
 * Check whether requested items can be fulfilled from available inventory.
 * Throws or returns an error object if insufficient.
 */
export const checkStockAvailability = async (items = []) => {
  for (const item of items) {
    const pId = item.productId;
    const inv = inMemoryInventory.find((i) => i.productId === pId || i.productCode === item.productCode);
    const requestedQty = parseInt(item.quantity, 10) || 0;

    if (!inv) {
      // If product not tracked in demo inventory, pass gracefully
      continue;
    }

    if ((inv.availableStock || 0) < requestedQty) {
      return {
        available: false,
        message: `Insufficient stock for ${inv.productName}. Available: ${inv.availableStock}, Requested: ${requestedQty}`
      };
    }
  }

  return { available: true };
};

/**
 * Deduct inventory for all items in a generated bill and record BILL_SALE movements.
 */
export const deductStockForBillItems = async (billItems = [], bill, user) => {
  const movements = [];
  const now = new Date().toISOString();

  for (const item of billItems) {
    const qty = parseInt(item.quantity, 10) || 0;
    if (qty <= 0) continue;

    const idx = inMemoryInventory.findIndex(
      (inv) => inv.productId === item.productId || inv.productCode === item.productCode
    );

    if (idx !== -1) {
      const target = inMemoryInventory[idx];
      const prevStock = target.currentStock || 0;
      const newStock = Math.max(0, prevStock - qty);
      const newStatus = computeStatus(newStock, target.minimumStock);
      const nextMvNum = await getNextMovementNumber();

      const mv = {
        id: `mv-bill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        movementNumber: nextMvNum,
        inventoryId: target.id,
        productId: target.productId,
        productCode: target.productCode,
        productName: target.productName,
        movementType: "BILL_SALE",
        quantity: qty,
        previousStock: prevStock,
        newStock: newStock,
        referenceType: "BILL",
        referenceId: bill.billNumber || bill.id,
        reason: `Sold on Invoice #${bill.billNumber} to ${bill.customer?.customerName || "Retailer"}`,
        performedBy: user?.name || "Billing Engine",
        createdAt: now
      };

      inMemoryStockMovements.unshift(mv);
      movements.push(mv);

      inMemoryInventory[idx] = {
        ...target,
        currentStock: newStock,
        availableStock: Math.max(0, newStock - (target.reservedStock || 0)),
        status: newStatus,
        lastMovementAt: now,
        updatedBy: user?.name || "Billing Engine",
        updatedAt: now
      };

      console.log(
        `[AUDIT] Product: ${target.productName} | Action: BILL_SALE | Quantity: ${qty} | Previous Stock: ${prevStock} | New Stock: ${newStock} | Reference: ${bill.billNumber}`
      );
    }
  }

  return movements;
};

export const findInventoryItems = findInventory;
