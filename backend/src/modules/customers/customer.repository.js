// Operational Customers Repository with MongoDB Atlas + In-Memory Fallback
import Customer from "../../models/Customer.js";
import { isDatabaseConnected } from "../../config/database.js";

let initialCustomers = [];
let customerCounter = 1;

export const generateCustomerCode = async () => {
  if (isDatabaseConnected()) {
    try {
      const latest = await Customer.findOne().sort({ createdAt: -1 }).lean();
      if (latest && latest.customerCode) {
        const num = parseInt(latest.customerCode.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num)) {
          return `CUS-${String(num + 1).padStart(6, "0")}`;
        }
      }
    } catch (e) {}
  }
  const code = `CUS-${String(customerCounter).padStart(6, "0")}`;
  customerCounter++;
  return code;
};

export const findCustomers = async ({
  page = 1,
  limit = 25,
  search = "",
  status = "",
  routeId = "",
  salesmanId = "",
  areaId = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  scopedSalesmanId = null,
  unassignedOnly = false
}) => {
  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (status && status !== "ALL") filter.status = status;
      if (routeId && routeId !== "ALL") filter.routeId = routeId;
      if (areaId && areaId !== "ALL") filter.areaId = areaId;
      if (scopedSalesmanId) {
        filter.$or = [{ salesmanId: scopedSalesmanId }, { salesmanName: "Rahul Kumar" }];
      } else if (salesmanId && salesmanId !== "ALL") {
        filter.salesmanId = salesmanId;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { shopName: regex },
          { ownerName: regex },
          { customerCode: regex },
          { mobile: regex }
        ];
      }

      const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const [list, total] = await Promise.all([
        Customer.find(filter)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        Customer.countDocuments(filter)
      ]);

      if (list && list.length > 0) {
        return {
          data: list.map((c) => ({ ...c, id: c._id.toString() })),
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
        };
      }
    } catch (e) {
      console.warn("MongoDB Customer query failed, falling back to memory:", e.message);
    }
  }

  // In-Memory Fallback
  let list = [...initialCustomers];

  if (scopedSalesmanId) {
    list = list.filter((c) => 
      c.salesmanId === scopedSalesmanId || 
      (scopedSalesmanId === "user-salesman-01" && (c.salesmanId === "user-salesman-01" || c.salesmanId === "SM-000001" || c.salesmanName === "Rahul Kumar")) ||
      (scopedSalesmanId && c.salesmanName?.toLowerCase() === "rahul kumar")
    );
  } else if (unassignedOnly) {
    list = list.filter((c) => !c.salesmanId || !c.routeId || c.salesmanId === "UNASSIGNED" || c.routeId === "UNASSIGNED" || c.salesmanId === "Unassigned");
  } else if (salesmanId) {
    if (salesmanId === "UNASSIGNED") {
      list = list.filter((c) => !c.salesmanId || c.salesmanId === "Unassigned");
    } else {
      list = list.filter((c) => c.salesmanId === salesmanId);
    }
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.shopName.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.mobile.includes(q)
    );
  }

  if (status && status !== "ALL") {
    list = list.filter((c) => c.status === status);
  }
  if (routeId && routeId !== "ALL") {
    list = list.filter((c) => c.routeId === routeId);
  }
  if (areaId && areaId !== "ALL") {
    list = list.filter((c) => c.areaId === areaId);
  }

  list.sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = list.slice(startIndex, startIndex + limitNum);

  return {
    data: paginatedData,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages
  };
};

export const findCustomerById = async (id) => {
  if (isDatabaseConnected()) {
    try {
      const c = await Customer.findOne({
        $or: [
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { id },
          { customerCode: id }
        ]
      }).lean();
      if (c) return { ...c, id: c._id.toString() };
    } catch (e) {}
  }
  return initialCustomers.find((c) => c.id === id || c.customerCode === id) || null;
};

export const findCustomerByMobile = async (mobile) => {
  if (isDatabaseConnected()) {
    try {
      const c = await Customer.findOne({ mobile: mobile.trim() }).lean();
      if (c) return { ...c, id: c._id.toString() };
    } catch (e) {}
  }
  return initialCustomers.find((c) => c.mobile === mobile.trim()) || null;
};

export const createCustomerRecord = async (customerData) => {
  const code = customerData.customerCode || await generateCustomerCode();
  const now = new Date().toISOString();

  const newCustomerData = {
    customerCode: code,
    shopName: customerData.shopName.trim(),
    ownerName: (customerData.ownerName || "").trim(),
    mobile: customerData.mobile.trim(),
    alternateMobile: (customerData.alternateMobile || "").trim(),
    email: (customerData.email || "").trim(),
    address: customerData.address.trim(),
    areaId: customerData.areaId || "AREA-01",
    areaName: customerData.areaName || "Raipur Central",
    routeId: customerData.routeId || "ROUTE-A",
    routeName: customerData.routeName || "Route A - Main Market",
    salesmanId: customerData.salesmanId || "user-salesman-01",
    salesmanName: customerData.salesmanName || "Rahul Kumar",
    creditLimit: parseFloat(customerData.creditLimit) || 0,
    openingBalance: parseFloat(customerData.openingBalance) || 0,
    paymentTerms: customerData.paymentTerms || "Net 15 Days",
    status: customerData.status || "ACTIVE",
    statusReason: customerData.statusReason || "",
    notes: (customerData.notes || "").trim(),
    createdBy: customerData.createdBy || "system",
    updatedBy: customerData.updatedBy || "system"
  };

  if (isDatabaseConnected()) {
    try {
      const saved = await Customer.create(newCustomerData);
      return { ...saved.toObject(), id: saved._id.toString() };
    } catch (e) {
      if (e.code === 11000) {
        const existing = await Customer.findOne({ $or: [{ customerCode: newCustomerData.customerCode }, { shopName: newCustomerData.shopName }] }).lean();
        if (existing) return { ...existing, id: existing._id.toString() };
      }
      console.warn("MongoDB Customer create failed, saving to memory:", e.message);
    }
  }

  const memoryCustomer = {
    id: customerData.id || `cus-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ...newCustomerData,
    createdAt: now,
    updatedAt: now
  };
  initialCustomers.unshift(memoryCustomer);
  return memoryCustomer;
};

export const updateCustomerRecord = async (id, updateData) => {
  if (isDatabaseConnected()) {
    try {
      const updated = await Customer.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { customerCode: id }] },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (updated) return { ...updated, id: updated._id.toString() };
    } catch (e) {}
  }

  const index = initialCustomers.findIndex((c) => c.id === id || c.customerCode === id);
  if (index === -1) return null;

  const current = initialCustomers[index];
  const updated = {
    ...current,
    ...updateData,
    shopName: updateData.shopName ? updateData.shopName.trim() : current.shopName,
    ownerName: updateData.ownerName !== undefined ? updateData.ownerName.trim() : current.ownerName,
    mobile: updateData.mobile ? updateData.mobile.trim() : current.mobile,
    address: updateData.address ? updateData.address.trim() : current.address,
    creditLimit: updateData.creditLimit !== undefined ? parseFloat(updateData.creditLimit) : current.creditLimit,
    openingBalance: updateData.openingBalance !== undefined ? parseFloat(updateData.openingBalance) : current.openingBalance,
    updatedAt: new Date().toISOString()
  };

  initialCustomers[index] = updated;
  return updated;
};

export const updateCustomerStatusRecord = async (id, status, statusReason = "", updatedBy = "system") => {
  if (isDatabaseConnected()) {
    try {
      const updated = await Customer.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }, { customerCode: id }] },
        { status, statusReason, updatedBy, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (updated) return { ...updated, id: updated._id.toString() };
    } catch (e) {}
  }

  const index = initialCustomers.findIndex((c) => c.id === id || c.customerCode === id);
  if (index === -1) return null;

  initialCustomers[index].status = status;
  initialCustomers[index].statusReason = statusReason;
  initialCustomers[index].updatedBy = updatedBy;
  initialCustomers[index].updatedAt = new Date().toISOString();

  return initialCustomers[index];
};
