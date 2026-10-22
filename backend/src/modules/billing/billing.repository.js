import Bill from "../../models/Bill.js";
import { isDatabaseConnected } from "../../config/database.js";

// Helper for consistent 2-decimal financial rounding
const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

// Pre-seeded 12 realistic FMCG distributor demo bills
const INITIAL_DEMO_BILLS = [];

let inMemoryBills = [];
let billSequenceCounter = 0;

export const getNextBillNumber = async () => {
  if (isDatabaseConnected()) {
    const latest = await Bill.findOne().sort({ createdAt: -1 });
    if (latest && latest.billNumber) {
      const match = latest.billNumber.match(/INV-\d{4}-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        const year = new Date().getFullYear();
        return `INV-${year}-${String(nextNum).padStart(6, "0")}`;
      }
    }
  }

  billSequenceCounter += 1;
  const year = new Date().getFullYear();
  return `INV-${year}-${String(billSequenceCounter).padStart(6, "0")}`;
};

export const findBills = async ({
  page = 1,
  limit = 10,
  search = "",
  billStatus = "ALL",
  paymentStatus = "ALL",
  salesmanId = "",
  customerId = ""
} = {}) => {
  const skip = (page - 1) * limit;

  if (isDatabaseConnected()) {
    const filter = {};
    if (billStatus && billStatus !== "ALL") {
      filter.billStatus = billStatus;
    }
    if (paymentStatus && paymentStatus !== "ALL") {
      filter.paymentStatus = paymentStatus;
    }
    if (salesmanId) {
      filter.$or = [
        { "salesman.salesmanId": salesmanId },
        { "salesman.userId": salesmanId }
      ];
    }
    if (customerId) {
      filter.$or = [
        { "customer.customerId": customerId },
        { "customer.customerCode": customerId }
      ];
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { billNumber: regex },
        { orderNumber: regex },
        { "customer.customerName": regex },
        { "customer.customerCode": regex },
        { "salesman.salesmanName": regex }
      ];
    }

    const [bills, total] = await Promise.all([
      Bill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Bill.countDocuments(filter)
    ]);

    const formattedBills = bills.map((b) => ({
      ...b,
      id: b._id.toString()
    }));

    return {
      bills: formattedBills,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  // In-Memory Fallback
  let filtered = [...inMemoryBills];

  if (billStatus && billStatus !== "ALL") {
    filtered = filtered.filter((b) => b.billStatus === billStatus);
  }
  if (paymentStatus && paymentStatus !== "ALL") {
    filtered = filtered.filter((b) => b.paymentStatus === paymentStatus);
  }
  if (salesmanId) {
    filtered = filtered.filter(
      (b) => b.salesman?.salesmanId === salesmanId || b.salesman?.userId === salesmanId
    );
  }
  if (customerId) {
    filtered = filtered.filter(
      (b) => b.customer?.customerId === customerId || b.customer?.customerCode === customerId || b.customer?.id === customerId
    );
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((b) =>
      b.billNumber.toLowerCase().includes(q) ||
      b.orderNumber.toLowerCase().includes(q) ||
      (b.customer?.customerName && b.customer.customerName.toLowerCase().includes(q)) ||
      (b.customer?.customerCode && b.customer.customerCode.toLowerCase().includes(q)) ||
      (b.salesman?.salesmanName && b.salesman.salesmanName.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    bills: paginated,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1
  };
};

export const findBillById = async (id) => {
  if (isDatabaseConnected()) {
    const bill = await Bill.findById(id).lean() || await Bill.findOne({ billNumber: id }).lean();
    if (bill) {
      return { ...bill, id: bill._id.toString() };
    }
  }

  return inMemoryBills.find((b) => b.id === id || b.billNumber === id) || null;
};

export const findBillByOrderId = async (orderId) => {
  if (isDatabaseConnected()) {
    const bill = await Bill.findOne({
      $or: [{ orderId }, { orderNumber: orderId }]
    }).lean();
    if (bill) {
      return { ...bill, id: bill._id.toString() };
    }
  }

  return inMemoryBills.find((b) => b.orderId === orderId || b.orderNumber === orderId) || null;
};

export const createBillRecord = async (billData) => {
  if (isDatabaseConnected()) {
    const doc = new Bill(billData);
    const saved = await doc.save();
    return { ...saved.toObject(), id: saved._id.toString() };
  }

  const newBill = {
    id: `bill-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ...billData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inMemoryBills.unshift(newBill);
  return newBill;
};

export const lockBillRecord = async (id, user) => {
  const lockTime = new Date().toISOString();

  if (isDatabaseConnected()) {
    const updated = await Bill.findByIdAndUpdate(
      id,
      {
        billStatus: "LOCKED",
        isLocked: true,
        lockedAt: lockTime,
        lockedBy: `${user.name} (${user.role})`,
        updatedBy: user.name
      },
      { new: true }
    ).lean();

    if (updated) {
      return { ...updated, id: updated._id.toString() };
    }
  }

  const idx = inMemoryBills.findIndex((b) => b.id === id || b.billNumber === id);
  if (idx !== -1) {
    inMemoryBills[idx] = {
      ...inMemoryBills[idx],
      billStatus: "LOCKED",
      isLocked: true,
      lockedAt: lockTime,
      lockedBy: `${user.name} (${user.role})`,
      updatedBy: user.name,
      updatedAt: lockTime
    };
    return inMemoryBills[idx];
  }

  return null;
};

export const cancelBillRecord = async (id, reason, user) => {
  const cancelTime = new Date().toISOString();

  if (isDatabaseConnected()) {
    const updated = await Bill.findByIdAndUpdate(
      id,
      {
        billStatus: "CANCELLED",
        cancelledAt: cancelTime,
        cancelledBy: `${user.name} (${user.role})`,
        cancelReason: reason,
        updatedBy: user.name
      },
      { new: true }
    ).lean();

    if (updated) {
      return { ...updated, id: updated._id.toString() };
    }
  }

  const idx = inMemoryBills.findIndex((b) => b.id === id || b.billNumber === id);
  if (idx !== -1) {
    inMemoryBills[idx] = {
      ...inMemoryBills[idx],
      billStatus: "CANCELLED",
      cancelledAt: cancelTime,
      cancelledBy: `${user.name} (${user.role})`,
      cancelReason: reason,
      updatedBy: user.name,
      updatedAt: cancelTime
    };
    return inMemoryBills[idx];
  }

  return null;
};

export const findOpenBillsByCustomer = async (customerId) => {
  if (isDatabaseConnected()) {
    const bills = await Bill.find({
      $or: [
        { "customer.customerId": customerId },
        { "customer.customerCode": customerId }
      ],
      billStatus: "LOCKED",
      paymentStatus: { $ne: "PAID" },
      outstandingAmount: { $gt: 0 }
    })
      .sort({ billDate: 1 })
      .lean();

    return bills.map((b) => ({ ...b, id: b._id.toString() }));
  }

  return inMemoryBills.filter((b) => {
    const matchCustomer =
      b.customer?.customerId === customerId ||
      b.customer?.customerCode === customerId ||
      b.customer?.id === customerId;
    const isLocked = b.billStatus === "LOCKED";
    const hasOutstanding = Number(b.outstandingAmount) > 0 && b.paymentStatus !== "PAID";
    return matchCustomer && isLocked && hasOutstanding;
  });
};

export const applyPaymentToBill = async (billId, allocatedAmount, user) => {
  const numAllocated = round2(allocatedAmount);
  if (numAllocated <= 0) return null;

  if (isDatabaseConnected()) {
    const existing = await Bill.findById(billId) || await Bill.findOne({ billNumber: billId });
    if (!existing) return null;

    const newPaid = round2(existing.paidAmount + numAllocated);
    const newOutstanding = round2(Math.max(0, existing.totalAmount - newPaid));
    const newPaymentStatus = newPaid >= existing.totalAmount ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    existing.paidAmount = newPaid;
    existing.outstandingAmount = newOutstanding;
    existing.paymentStatus = newPaymentStatus;
    existing.updatedBy = user?.name || "System";
    const saved = await existing.save();
    return { ...saved.toObject(), id: saved._id.toString() };
  }

  const idx = inMemoryBills.findIndex((b) => b.id === billId || b.billNumber === billId);
  if (idx !== -1) {
    const b = inMemoryBills[idx];
    const newPaid = round2(Number(b.paidAmount || 0) + numAllocated);
    const newOutstanding = round2(Math.max(0, Number(b.totalAmount || 0) - newPaid));
    const newPaymentStatus = newPaid >= Number(b.totalAmount || 0) ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    inMemoryBills[idx] = {
      ...b,
      paidAmount: newPaid,
      outstandingAmount: newOutstanding,
      balanceAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
      updatedBy: user?.name || "System",
      updatedAt: new Date().toISOString()
    };
    return inMemoryBills[idx];
  }

  return null;
};

export const revertPaymentFromBill = async (billId, allocatedAmount, user) => {
  const numAllocated = round2(allocatedAmount);
  if (numAllocated <= 0) return null;

  if (isDatabaseConnected()) {
    const existing = await Bill.findById(billId) || await Bill.findOne({ billNumber: billId });
    if (!existing) return null;

    const newPaid = round2(Math.max(0, existing.paidAmount - numAllocated));
    const newOutstanding = round2(Math.min(existing.totalAmount, existing.outstandingAmount + numAllocated));
    const newPaymentStatus = newOutstanding === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    existing.paidAmount = newPaid;
    existing.outstandingAmount = newOutstanding;
    existing.paymentStatus = newPaymentStatus;
    existing.updatedBy = user?.name || "System";
    const saved = await existing.save();
    return { ...saved.toObject(), id: saved._id.toString() };
  }

  const idx = inMemoryBills.findIndex((b) => b.id === billId || b.billNumber === billId);
  if (idx !== -1) {
    const b = inMemoryBills[idx];
    const newPaid = round2(Math.max(0, Number(b.paidAmount || 0) - numAllocated));
    const newOutstanding = round2(Math.min(Number(b.totalAmount || 0), Number(b.outstandingAmount || 0) + numAllocated));
    const newPaymentStatus = newOutstanding === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    inMemoryBills[idx] = {
      ...b,
      paidAmount: newPaid,
      outstandingAmount: newOutstanding,
      balanceAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
      updatedBy: user?.name || "System",
      updatedAt: new Date().toISOString()
    };
    return inMemoryBills[idx];
  }

  return null;
};

export const findBillsReadyForDispatch = async (filters = {}) => {
  if (isDatabaseConnected()) {
    const query = {
      billStatus: "LOCKED",
      deliveryStatus: { $in: ["READY_FOR_DISPATCH", null] }
    };
    if (filters.routeId) query["customer.routeId"] = filters.routeId;
    if (filters.salesmanId) query["salesman.salesmanId"] = filters.salesmanId;
    const docs = await Bill.find(query).sort({ billDate: -1 }).lean();
    return docs.map((d) => ({ ...d, id: d._id.toString() }));
  }

  return inMemoryBills.filter((b) => {
    const isLocked = b.billStatus === "LOCKED";
    const isReady = b.deliveryStatus === "READY_FOR_DISPATCH" || !b.deliveryStatus;
    const matchRoute = !filters.routeId || b.customer?.routeId === filters.routeId;
    const matchSalesman = !filters.salesmanId || b.salesman?.salesmanId === filters.salesmanId;
    return isLocked && isReady && matchRoute && matchSalesman;
  });
};

export const updateBillDeliveryStatus = async (billId, status, details = {}) => {
  if (isDatabaseConnected()) {
    const existing = await Bill.findById(billId) || await Bill.findOne({ billNumber: billId });
    if (!existing) return null;
    existing.deliveryStatus = status;
    if (details.tripId !== undefined) existing.tripId = details.tripId;
    if (details.tripNumber !== undefined) existing.tripNumber = details.tripNumber;
    if (details.deliveredAt !== undefined) existing.deliveredAt = details.deliveredAt;
    if (details.deliveryRemarks !== undefined) existing.deliveryRemarks = details.deliveryRemarks;
    existing.updatedBy = details.user?.name || "System";
    const saved = await existing.save();
    return { ...saved.toObject(), id: saved._id.toString() };
  }

  const idx = inMemoryBills.findIndex((b) => b.id === billId || b.billNumber === billId);
  if (idx !== -1) {
    const b = inMemoryBills[idx];
    inMemoryBills[idx] = {
      ...b,
      deliveryStatus: status,
      tripId: details.tripId !== undefined ? details.tripId : b.tripId,
      tripNumber: details.tripNumber !== undefined ? details.tripNumber : b.tripNumber,
      deliveredAt: details.deliveredAt !== undefined ? details.deliveredAt : b.deliveredAt,
      deliveryRemarks: details.deliveryRemarks !== undefined ? details.deliveryRemarks : b.deliveryRemarks,
      updatedBy: details.user?.name || "System",
      updatedAt: new Date().toISOString()
    };
    return inMemoryBills[idx];
  }

  return null;
};


