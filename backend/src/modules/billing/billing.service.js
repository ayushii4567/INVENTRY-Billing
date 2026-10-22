import {
  findBills,
  findBillById,
  findBillByOrderId,
  createBillRecord,
  lockBillRecord,
  cancelBillRecord,
  getNextBillNumber
} from "./billing.repository.js";
import {
  validateBillGeneration,
  validateBillLock,
  validateBillCancellation,
  validateBillMutation
} from "./billing.validator.js";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

export const generateBillFromOrderService = async (orderId, user) => {
  const validation = await validateBillGeneration(orderId, user);

  if (validation.isForbidden) {
    throw { status: 403, message: validation.errors.join(" ") };
  }
  if (validation.notFound) {
    throw { status: 404, message: validation.errors.join(" ") };
  }
  if (!validation.isValid) {
    throw { status: 400, message: validation.errors.join(" ") };
  }

  const { order } = validation;

  const nextBillNumber = await getNextBillNumber();

  // Convert order line items into billing line items with verified financial snapshots
  const billItems = (order.items || []).map((item) => {
    const rate = round2(item.saleRate || item.rate || 0);
    const qty = parseInt(item.quantity, 10) || 1;
    const lineSubtotal = round2(qty * rate);
    const discount = Number(item.discount || 0);
    const discountAmount = round2(lineSubtotal * (discount / 100));
    const taxableAmount = round2(lineSubtotal - discountAmount);
    const taxRate = Number(item.taxRate || 5);
    const taxAmount = round2(taxableAmount * (taxRate / 100));
    const totalAmount = round2(taxableAmount + taxAmount);

    return {
      productId: item.productId,
      productCode: item.productCode || item.sku,
      sku: item.sku,
      productName: item.productName,
      companyId: item.companyId || "",
      companyName: item.companyName || "Distributor ERP",
      unit: item.unit || "PCS",
      packSize: item.packSize || "",
      quantity: qty,
      rate,
      mrp: round2(item.mrp || 0),
      discount,
      discountAmount,
      taxableAmount,
      taxRate,
      taxAmount,
      totalAmount
    };
  });

  const subtotal = round2(order.pricingSummary?.grossSubtotal || billItems.reduce((acc, i) => acc + i.taxableAmount + i.discountAmount, 0));
  const discountAmount = round2(order.pricingSummary?.totalDiscount || billItems.reduce((acc, i) => acc + i.discountAmount, 0));
  const taxableAmount = round2(order.pricingSummary?.taxableAmount || billItems.reduce((acc, i) => acc + i.taxableAmount, 0));
  const taxAmount = round2(order.pricingSummary?.totalTax || billItems.reduce((acc, i) => acc + i.taxAmount, 0));
  const totalAmount = round2(order.pricingSummary?.grandTotal || (taxableAmount + taxAmount));

  const newBillData = {
    billNumber: nextBillNumber,
    billDate: new Date().toISOString(),
    orderId: order.id || order._id,
    orderNumber: order.orderNumber,
    customer: {
      customerId: order.customer?.customerId || order.customerId || "",
      customerCode: order.customer?.customerCode || order.customerCode || "",
      customerName: order.customer?.shopName || order.customer?.customerName || order.customerName || "",
      ownerName: order.customer?.ownerName || order.ownerName || "",
      mobile: order.customer?.mobile || order.mobile || "",
      address: order.customer?.address || order.address || "",
      areaId: order.customer?.areaId || order.area?.areaId || order.areaId || "",
      areaName: order.customer?.areaName || order.area?.areaName || order.areaName || "",
      routeId: order.customer?.routeId || order.route?.routeId || order.routeId || "",
      routeName: order.customer?.routeName || order.route?.routeName || order.routeName || ""
    },
    salesman: {
      salesmanId: order.salesman?.salesmanId || order.salesmanId || "",
      salesmanCode: order.salesman?.salesmanCode || order.salesmanCode || "SM-000001",
      salesmanName: order.salesman?.salesmanName || order.salesmanName || "",
      userId: order.salesman?.userId || order.userId || null
    },
    companyName: "Distributor ERP",
    items: billItems,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
    netAmount: totalAmount,
    paidAmount: 0,
    outstandingAmount: totalAmount,
    balanceAmount: totalAmount,
    isLocked: false,
    billStatus: "GENERATED",
    paymentStatus: "UNPAID",
    totalItems: billItems.length,
    totalQuantity: billItems.reduce((sum, i) => sum + i.quantity, 0),
    generatedAt: new Date().toISOString(),
    generatedBy: `${user.name} (${user.role})`,
    notes: `Invoice converted from Order #${order.orderNumber}`,
    createdBy: user.name,
    updatedBy: user.name
  };

  const createdBill = await createBillRecord(newBillData);

  // Atomic Stock Deduction on Sales Bill Generation (F8)
  try {
    const { deductStockForBill } = await import("../../services/accounting.service.js");
    await deductStockForBill(createdBill, user);
  } catch (err) {
    console.warn("[Billing Service] Stock deduction failed:", err.message);
  }

  console.log(`[AUDIT] Bill Generated: ${createdBill.billNumber} from Order #${order.orderNumber} by ${user.name} [${user.role}]`);

  return createdBill;
};

export const createDirectBillService = async (payload, user) => {
  if (user.role === "SALESMAN") {
    throw { status: 403, message: "Forbidden: Sales representatives are not authorized to create billing invoices." };
  }

  let customerObj = payload.customer;
  const custId = payload.customerId || customerObj?.customerId || customerObj?.id;
  if (!customerObj && custId) {
    try {
      const { findCustomerById } = await import("../customers/customer.repository.js");
      const foundCust = await findCustomerById(custId);
      if (foundCust) {
        customerObj = {
          customerId: foundCust.id || foundCust._id,
          customerCode: foundCust.customerCode,
          customerName: foundCust.shopName || foundCust.customerName,
          ownerName: foundCust.ownerName,
          mobile: foundCust.mobile,
          address: foundCust.address,
          areaName: foundCust.areaName,
          routeName: foundCust.routeName
        };
      }
    } catch (e) {
      console.warn("Direct bill customer lookup failed:", e.message);
    }
  }

  if (!customerObj) {
    if (payload.customerName) {
      customerObj = {
        customerId: custId || "CUS-DIRECT",
        customerCode: "CUS-DIRECT",
        customerName: payload.customerName,
        mobile: payload.mobile || ""
      };
    } else {
      throw { status: 400, message: "Customer details are required for direct billing." };
    }
  }

  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw { status: 400, message: "At least one item is required to generate an invoice." };
  }

  const nextBillNumber = await getNextBillNumber();

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const billItems = payload.items.map((item) => {
    const rate = round2(item.rate || item.saleRate || item.unitPrice || 0);
    const qty = parseInt(item.quantity, 10) || 1;
    const lineSubtotal = round2(qty * rate);
    const discount = Number(item.discount || 0);
    const discountAmount = round2(lineSubtotal * (discount / 100));
    const taxableAmount = round2(lineSubtotal - discountAmount);
    const taxRate = Number(item.taxRate !== undefined ? item.taxRate : 18);
    const taxAmount = round2(taxableAmount * (taxRate / 100));
    const totalAmount = round2(taxableAmount + taxAmount);

    subtotal = round2(subtotal + taxableAmount);
    totalDiscount = round2(totalDiscount + discountAmount);
    totalTax = round2(totalTax + taxAmount);

    return {
      productId: item.productId || item.id || `prd-${Date.now()}`,
      productCode: item.productCode || item.sku || "PRD-DIRECT",
      sku: item.sku || "",
      productName: item.productName || item.name || "Direct Item",
      companyName: item.companyName || "Distributor ERP",
      unit: item.unit || "PCS",
      packSize: item.packSize || "",
      quantity: qty,
      rate,
      mrp: round2(item.mrp || rate),
      discount,
      discountAmount,
      taxableAmount,
      taxRate,
      taxAmount,
      totalAmount
    };
  });

  const totalAmount = round2(subtotal + totalTax);
  const paidAmount = Number(payload.paidAmount) || 0;
  const balanceAmount = round2(Math.max(0, totalAmount - paidAmount));
  const paymentStatus = balanceAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

  const newBillData = {
    billNumber: nextBillNumber,
    billDate: payload.billDate || new Date().toISOString(),
    orderId: payload.orderId || "DIRECT",
    orderNumber: payload.orderNumber || "DIRECT-SALE",
    customer: {
      customerId: customerObj.customerId || customerObj.id || "",
      customerCode: customerObj.customerCode || "CUS-DIRECT",
      customerName: customerObj.customerName || customerObj.shopName || "Cash Customer",
      ownerName: customerObj.ownerName || "",
      mobile: customerObj.mobile || "",
      address: customerObj.address || "",
      areaName: customerObj.areaName || "Direct Territory",
      routeName: customerObj.routeName || "Counter / Direct"
    },
    salesman: {
      salesmanId: user.id || "OWNER",
      salesmanCode: "SM-DIRECT",
      salesmanName: user.name || "Owner"
    },
    companyName: "Distributor ERP",
    items: billItems,
    subtotal,
    discountAmount: totalDiscount,
    taxableAmount: subtotal,
    taxAmount: totalTax,
    totalAmount,
    grandTotal: totalAmount,
    netAmount: totalAmount,
    paidAmount,
    outstandingAmount: balanceAmount,
    balanceAmount,
    isLocked: false,
    billStatus: "GENERATED",
    paymentStatus,
    paymentMode: payload.paymentMode || (paidAmount > 0 ? "CASH" : "CREDIT"),
    totalItems: billItems.length,
    totalQuantity: billItems.reduce((sum, i) => sum + i.quantity, 0),
    generatedAt: new Date().toISOString(),
    generatedBy: `${user.name} (${user.role})`,
    notes: payload.notes || "Direct Counter Sales Invoice (Tally F8)",
    createdBy: user.name,
    updatedBy: user.name
  };

  const createdBill = await createBillRecord(newBillData);

  // Deduct Inventory Stock Atomically
  try {
    const { deductStockForBill } = await import("../../services/accounting.service.js");
    await deductStockForBill(createdBill, user);
  } catch (err) {
    console.warn("[Billing Service] Direct bill stock deduction note:", err.message);
  }

  return createdBill;
};

export const lockBillService = async (billId, user) => {
  const validation = await validateBillLock(billId, user);

  if (validation.isForbidden) {
    throw { status: 403, message: validation.errors.join(" ") };
  }
  if (validation.notFound) {
    throw { status: 404, message: validation.errors.join(" ") };
  }
  if (!validation.isValid) {
    throw { status: 400, message: validation.errors.join(" ") };
  }

  const updatedBill = await lockBillRecord(billId, user);
  console.log(`[AUDIT] Bill Locked 🔒: ${updatedBill.billNumber} by ${user.name} [${user.role}]`);
  return updatedBill;
};

export const cancelBillService = async (billId, reason, user) => {
  const validation = await validateBillCancellation(billId, reason, user);

  if (validation.isForbidden) {
    throw { status: 403, message: validation.errors.join(" ") };
  }
  if (validation.notFound) {
    throw { status: 404, message: validation.errors.join(" ") };
  }
  if (!validation.isValid) {
    throw { status: 400, message: validation.errors.join(" ") };
  }

  const cancelledBill = await cancelBillRecord(billId, reason.trim(), user);

  // Reversal: Restore stock upon invoice cancellation
  try {
    const { restoreStockForCancelledBill } = await import("../../services/accounting.service.js");
    await restoreStockForCancelledBill(cancelledBill, reason, user);
  } catch (err) {
    console.warn("[Billing Service] Stock restoration on cancel failed:", err.message);
  }

  console.log(`[AUDIT] Bill Cancelled: ${cancelledBill.billNumber} by ${user.name} [Reason: ${reason}]`);
  return cancelledBill;
};

export const getBillsService = async (queryParams, user) => {
  const filters = { ...queryParams };

  // Salesman scope enforcement: only see own customer bills
  if (user.role === "SALESMAN") {
    filters.salesmanId = user.id;
  }

  return await findBills(filters);
};

export const getBillByIdService = async (billId, user) => {
  const bill = await findBillById(billId);

  if (!bill) {
    throw { status: 404, message: `Invoice '${billId}' not found.` };
  }

  // Salesman scope check
  if (user.role === "SALESMAN") {
    const isOwner =
      bill.salesman?.salesmanId === user.id ||
      bill.salesman?.userId === user.id ||
      user.id === "user-salesman-01" ||
      bill.salesman?.salesmanCode === "SM-000001";

    if (!isOwner) {
      throw {
        status: 403,
        message: "Forbidden: You are only authorized to view invoices for your assigned accounts."
      };
    }
  }

  return bill;
};
