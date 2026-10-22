import Supplier from "../../models/Supplier.js";
import { isDatabaseConnected } from "../../config/database.js";

let inMemorySuppliers = [
  {
    id: "sup-001",
    _id: "sup-001",
    supplierCode: "SUP-001",
    supplierName: "Nestlé India Limited",
    contactPerson: "Alok Sengupta (Depot Manager)",
    mobile: "9826112233",
    email: "depot.raipur@in.nestle.com",
    address: "Plot 14-16, Urla Industrial Complex",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492003",
    gstin: "22AAACN0142D1Z8",
    openingBalance: 0,
    currentBalance: 84500,
    creditDays: 21,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "sup-002",
    _id: "sup-002",
    supplierCode: "SUP-002",
    supplierName: "Patanjali Ayurved Ltd (C&F)",
    contactPerson: "Rameshwar Patidar",
    mobile: "9826334455",
    email: "cnf.chhattisgarh@patanjali.org",
    address: "Transport Nagar, Tatibandh",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492099",
    gstin: "22AABCP7762K1ZU",
    openingBalance: 12500,
    currentBalance: 42000,
    creditDays: 30,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "sup-003",
    _id: "sup-003",
    supplierCode: "SUP-003",
    supplierName: "Hindustan Unilever Limited",
    contactPerson: "Virendra Verma",
    mobile: "9826556677",
    email: "depot.cg@unilever.com",
    address: "Bhanpuri Logistics Park",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "493221",
    gstin: "22AAACH1234M1Z2",
    openingBalance: 0,
    currentBalance: 0,
    creditDays: 15,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let supplierCounter = 3;

export const getNextSupplierCode = async () => {
  supplierCounter += 1;
  return `SUP-${String(supplierCounter).padStart(3, "0")}`;
};

export const findSuppliers = async ({ page = 1, limit = 50, search = "", status = "ALL" } = {}) => {
  const skip = (page - 1) * limit;

  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (status && status !== "ALL") filter.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { supplierName: regex },
          { supplierCode: regex },
          { contactPerson: regex },
          { mobile: regex },
          { gstin: regex }
        ];
      }

      let [suppliers, total] = await Promise.all([
        Supplier.find(filter).sort({ supplierName: 1 }).skip(skip).limit(limit).lean(),
        Supplier.countDocuments(filter)
      ]);

      if (total === 0 && !search && status === "ALL") {
        try {
          const toInsert = inMemorySuppliers.map(({ id, _id, ...rest }) => rest);
          await Supplier.insertMany(toInsert);
          suppliers = await Supplier.find().sort({ supplierName: 1 }).lean();
          total = suppliers.length;
        } catch (e) {
          // Ignore insert error
        }
      }

      if (suppliers && suppliers.length > 0) {
        return {
          suppliers: suppliers.map((s) => ({ ...s, id: s._id.toString() })),
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1
        };
      }
    } catch (err) {
      console.warn("MongoDB suppliers query failed, using in-memory:", err.message);
    }
  }

  // Fallback to in-memory suppliers
  let filtered = [...inMemorySuppliers];
  if (status && status !== "ALL") filtered = filtered.filter((s) => s.status === status);
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(q) ||
        s.supplierCode.toLowerCase().includes(q) ||
        (s.mobile && s.mobile.includes(q)) ||
        (s.gstin && s.gstin.toLowerCase().includes(q))
    );
  }
  const total = filtered.length;
  const paged = filtered.slice(skip, skip + limit);
  return {
    suppliers: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1
  };
};

export const findSupplierById = async (id) => {
  if (isDatabaseConnected()) {
    try {
      const s = await Supplier.findById(id).lean();
      if (s) return { ...s, id: s._id.toString() };
    } catch (e) {}
  }
  return inMemorySuppliers.find((s) => s.id === id || s._id === id || s.supplierCode === id) || null;
};

export const createSupplierRecord = async (data, user) => {
  const supplierCode = data.supplierCode || (await getNextSupplierCode());
  const payload = {
    ...data,
    supplierCode,
    openingBalance: Number(data.openingBalance) || 0,
    currentBalance: Number(data.currentBalance !== undefined ? data.currentBalance : (data.openingBalance || 0)),
    creditDays: Number(data.creditDays) || 30,
    status: data.status || "ACTIVE"
  };

  if (isDatabaseConnected()) {
    try {
      const created = await Supplier.create(payload);
      return { ...created.toObject(), id: created._id.toString() };
    } catch (e) {
      console.warn("MongoDB create supplier error, using memory:", e.message);
    }
  }

  const newSupplier = {
    ...payload,
    id: `sup-${Date.now()}`,
    _id: `sup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  inMemorySuppliers.unshift(newSupplier);
  return newSupplier;
};

export const updateSupplierRecord = async (id, data, user) => {
  if (isDatabaseConnected()) {
    try {
      const updated = await Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      if (updated) return { ...updated, id: updated._id.toString() };
    } catch (e) {}
  }

  const idx = inMemorySuppliers.findIndex((s) => s.id === id || s._id === id);
  if (idx === -1) return null;
  inMemorySuppliers[idx] = { ...inMemorySuppliers[idx], ...data, updatedAt: new Date().toISOString() };
  return inMemorySuppliers[idx];
};
