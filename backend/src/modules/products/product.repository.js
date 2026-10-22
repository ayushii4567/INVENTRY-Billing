// Operational Product Master Repository (Standard Tally ERP Stock Items)
import Product from "../../models/Product.js";
import { isDatabaseConnected } from "../../config/database.js";

export const DEFAULT_STANDARD_PRODUCTS = [
  {
    id: "prd-001",
    productCode: "PRD-000001",
    sku: "STD-ITM-001",
    productName: "Standard Item A (Finished Goods)",
    companyId: "GRP-FINISHED",
    companyName: "Finished Goods",
    category: "Finished Goods",
    subcategory: "General Standard Items",
    hsnCode: "84713010",
    unit: "PCS",
    packSize: "1 Pc",
    mrp: 1200,
    purchaseRate: 850,
    saleRate: 1050,
    taxRate: 18,
    discount: 0,
    minimumStock: 50,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-002",
    productCode: "PRD-000002",
    sku: "TRD-BOX-050",
    productName: "Commercial Pack Box (50 Units)",
    companyId: "GRP-TRADING",
    companyName: "Trading Goods",
    category: "Trading Goods",
    subcategory: "Packaged Commercial Goods",
    hsnCode: "48191010",
    unit: "BOX",
    packSize: "50 Units",
    mrp: 2000,
    purchaseRate: 1400,
    saleRate: 1750,
    taxRate: 12,
    discount: 0,
    minimumStock: 40,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-003",
    productCode: "PRD-000003",
    sku: "IND-ASM-101",
    productName: "Industrial Assembly Unit Type-1",
    companyId: "GRP-FINISHED",
    companyName: "Finished Goods",
    category: "Finished Goods",
    subcategory: "Assemblies & Modules",
    hsnCode: "85044090",
    unit: "NOS",
    packSize: "1 No",
    mrp: 3000,
    purchaseRate: 2100,
    saleRate: 2600,
    taxRate: 18,
    discount: 0,
    minimumStock: 25,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-004",
    productCode: "PRD-000004",
    sku: "HRD-FST-100",
    productName: "Hardware Fasteners Assorted Kit",
    companyId: "GRP-TRADING",
    companyName: "Trading Goods",
    category: "Trading Goods",
    subcategory: "Fasteners & Fixtures",
    hsnCode: "73181500",
    unit: "SET",
    packSize: "1 Set (100 Pcs)",
    mrp: 320,
    purchaseRate: 220,
    saleRate: 280,
    taxRate: 18,
    discount: 0,
    minimumStock: 30,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-005",
    productCode: "PRD-000005",
    sku: "RAW-MAT-025",
    productName: "Bulk Raw Material Pack 25kg",
    companyId: "GRP-RAW",
    companyName: "Raw Materials",
    category: "Raw Materials",
    subcategory: "Primary Bulk Input",
    hsnCode: "25010010",
    unit: "BAG",
    packSize: "25 Kg",
    mrp: 900,
    purchaseRate: 650,
    saleRate: 800,
    taxRate: 5,
    discount: 0,
    minimumStock: 30,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-006",
    productCode: "PRD-000006",
    sku: "CON-GEN-012",
    productName: "General Consumable Pack (Grade A)",
    companyId: "GRP-CONSUMABLES",
    companyName: "Consumables",
    category: "Consumables",
    subcategory: "General Operational Supply",
    hsnCode: "38140010",
    unit: "PKT",
    packSize: "12 Pkts",
    mrp: 550,
    purchaseRate: 380,
    saleRate: 480,
    taxRate: 18,
    discount: 0,
    minimumStock: 50,
    batchTracking: false,
    expiryTracking: false,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let initialProducts = [...DEFAULT_STANDARD_PRODUCTS];
let productCounter = 7;

export const resetToStandardTallyProducts = () => {
  initialProducts = [...DEFAULT_STANDARD_PRODUCTS];
  productCounter = 7;
  return initialProducts;
};

export const generateProductCode = async () => {
  if (isDatabaseConnected()) {
    try {
      const latest = await Product.findOne().sort({ createdAt: -1 }).lean();
      if (latest && latest.productCode) {
        const num = parseInt(latest.productCode.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num)) {
          return `PRD-${String(num + 1).padStart(6, "0")}`;
        }
      }
    } catch (e) {}
  }
  const code = `PRD-${String(productCounter).padStart(6, "0")}`;
  productCounter++;
  return code;
};

export const findProducts = async ({
  page = 1,
  limit = 25,
  search = "",
  companyId = "",
  category = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc"
}) => {
  if (isDatabaseConnected()) {
    try {
      const filter = {};
      if (status && status !== "ALL") filter.status = status;
      if (companyId && companyId !== "ALL") filter.companyId = companyId;
      if (category && category !== "ALL") filter.category = category;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { productName: regex },
          { sku: regex },
          { productCode: regex },
          { hsnCode: regex }
        ];
      }
      const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const [list, total] = await Promise.all([
        Product.find(filter)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        Product.countDocuments(filter)
      ]);
      if (list && list.length > 0) {
        return {
          data: list.map((p) => ({ ...p, id: p._id.toString() })),
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
        };
      }
    } catch (e) {
      console.warn("MongoDB Product query failed, falling back to memory:", e.message);
    }
  }

  let list = [...initialProducts];

  // 1. Search Filter (productName, sku, productCode, hsnCode)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        (p.hsnCode && p.hsnCode.toLowerCase().includes(q))
    );
  }

  // 2. Company / Stock Group Filter (flexible match)
  if (companyId && companyId !== "ALL") {
    const cid = companyId.toLowerCase();
    list = list.filter(
      (p) =>
        (p.companyId && p.companyId.toLowerCase() === cid) ||
        (p.companyName && p.companyName.toLowerCase() === cid) ||
        (p.category && p.category.toLowerCase() === cid)
    );
  }

  // 3. Category Filter
  if (category && category !== "ALL") {
    const cat = category.toLowerCase();
    list = list.filter(
      (p) =>
        (p.category && p.category.toLowerCase() === cat) ||
        (p.companyName && p.companyName.toLowerCase() === cat)
    );
  }

  // 4. Status Filter
  if (status && status !== "ALL") {
    list = list.filter((p) => p.status === status);
  }

  // 5. Sorting
  list.sort((a, b) => {
    let valA = a[sortBy] !== undefined ? a[sortBy] : "";
    let valB = b[sortBy] !== undefined ? b[sortBy] : "";
    
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // 6. Pagination
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

export const findActiveProducts = async () => {
  if (isDatabaseConnected()) {
    try {
      const list = await Product.find({ status: "ACTIVE" }).lean();
      if (list && list.length > 0) {
        return list.map((p) => ({
          id: p._id.toString(),
          productId: p._id.toString(),
          productCode: p.productCode,
          productName: p.productName,
          sku: p.sku,
          companyId: p.companyId,
          company: p.companyName,
          category: p.category,
          unit: p.unit,
          packSize: p.packSize,
          mrp: p.mrp,
          purchaseRate: p.purchaseRate || 0,
          saleRate: p.saleRate,
          taxRate: p.taxRate,
          minimumStock: p.minimumStock || 10,
          batchTracking: p.batchTracking,
          expiryTracking: p.expiryTracking
        }));
      }
    } catch (e) {}
  }

  return initialProducts
    .filter((p) => p.status === "ACTIVE")
    .map((p) => ({
      id: p.id,
      productId: p.id,
      productCode: p.productCode,
      productName: p.productName,
      sku: p.sku,
      companyId: p.companyId,
      company: p.companyName,
      category: p.category,
      unit: p.unit,
      packSize: p.packSize,
      mrp: p.mrp,
      purchaseRate: p.purchaseRate || 0,
      saleRate: p.saleRate,
      taxRate: p.taxRate,
      minimumStock: p.minimumStock || 10,
      batchTracking: p.batchTracking,
      expiryTracking: p.expiryTracking
    }));
};

export const findProductById = async (id) => {
  if (isDatabaseConnected()) {
    try {
      const p = await Product.findOne({
        $or: [
          { _id: id && id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { id },
          { productCode: id },
          { sku: id }
        ]
      }).lean();
      if (p) return { ...p, id: p._id.toString() };
    } catch (e) {}
  }
  return initialProducts.find((p) => p.id === id || p.productCode === id || p.sku === id) || null;
};

export const findProductBySku = async (sku) => {
  if (!sku) return null;
  if (isDatabaseConnected()) {
    try {
      const p = await Product.findOne({ sku: sku.trim().toUpperCase() }).lean();
      if (p) return { ...p, id: p._id.toString() };
    } catch (e) {}
  }
  return initialProducts.find((p) => p.sku.toUpperCase() === sku.trim().toUpperCase()) || null;
};

export const findProductByCode = async (productCode) => {
  if (!productCode) return null;
  if (isDatabaseConnected()) {
    try {
      const p = await Product.findOne({ productCode: productCode.trim() }).lean();
      if (p) return { ...p, id: p._id.toString() };
    } catch (e) {}
  }
  return initialProducts.find((p) => p.productCode === productCode.trim()) || null;
};

export const createProductRecord = async (productData) => {
  const newId = productData.id || `prd-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const code = productData.productCode || await generateProductCode();
  const now = new Date().toISOString();

  // Map companyId or Stock Group to display name
  const companyNameMap = {
    "GRP-FINISHED": "Finished Goods",
    "GRP-TRADING": "Trading Goods",
    "GRP-RAW": "Raw Materials",
    "GRP-CONSUMABLES": "Consumables",
    "GRP-GENERAL": "General Goods",
    "COMP-STANDARD": "Standard Supply",
    "COMP-GENERAL": "General Trade",
    "COMP-NESTLE": "Standard Supply",
    "COMP-PATANJALI": "General Trade",
    "COMP-GSK": "Industrial Goods"
  };
  const companyName = productData.companyName || companyNameMap[productData.companyId] || productData.companyId || "General Goods";

  const newProduct = {
    id: newId,
    productCode: code,
    sku: productData.sku.trim().toUpperCase(),
    productName: productData.productName.trim(),
    companyId: (productData.companyId || "GRP-GENERAL").trim(),
    companyName: companyName,
    category: (productData.category || "General Goods").trim(),
    subcategory: (productData.subcategory || "").trim(),
    hsnCode: (productData.hsnCode || productData.hsn || "84713010").trim(),
    unit: productData.unit || "PCS",
    packSize: (productData.packSize || "").trim(),
    mrp: parseFloat(productData.mrp) || 0,
    purchaseRate: parseFloat(productData.purchaseRate) || 0,
    saleRate: parseFloat(productData.saleRate) || 0,
    taxRate: parseFloat(productData.taxRate) !== undefined ? parseFloat(productData.taxRate) : 18,
    discount: parseFloat(productData.discount) || 0,
    minimumStock: parseInt(productData.minimumStock, 10) || 10,
    batchTracking: Boolean(productData.batchTracking),
    expiryTracking: Boolean(productData.expiryTracking),
    status: productData.status || "ACTIVE",
    description: (productData.description || "").trim(),
    createdBy: productData.createdBy || "system",
    updatedBy: productData.updatedBy || "system",
    createdAt: now,
    updatedAt: now
  };

  if (isDatabaseConnected()) {
    try {
      const saved = await Product.create(newProduct);
      const res = { ...saved.toObject(), id: saved._id.toString() };
      initialProducts.unshift(res);

      try {
        const Inventory = (await import("../../models/Inventory.js")).default;
        await Inventory.create({
          inventoryCode: `STK-${res.productCode ? res.productCode.replace("PRD-", "") : Date.now().toString().slice(-6)}`,
          productId: res.id,
          productCode: res.productCode,
          productName: res.productName,
          sku: res.sku,
          companyId: res.companyId || "GRP-TRADING",
          companyName: res.companyName || "Trading Goods",
          category: res.category || "Trading Goods",
          unit: res.unit || "PCS",
          currentStock: 0,
          availableStock: 0,
          purchaseRate: res.purchaseRate || 0,
          saleRate: res.saleRate || 0,
          minimumStock: res.minimumStock || 10,
          status: "OUT_OF_STOCK"
        });
      } catch (invErr) {}

      return res;
    } catch (e) {
      if (e.code === 11000) {
        const existing = await Product.findOne({ $or: [{ sku: newProduct.sku }, { productCode: newProduct.productCode }] }).lean();
        if (existing) {
          const res = { ...existing, id: existing._id.toString() };
          initialProducts.unshift(res);
          return res;
        }
      }
      console.warn("MongoDB Product create failed, saving to memory:", e.message);
    }
  }

  initialProducts.unshift(newProduct);
  return newProduct;
};

export const updateProductRecord = async (id, updateData) => {
  const index = initialProducts.findIndex((p) => p.id === id || p.productCode === id);
  if (index === -1) return null;

  const current = initialProducts[index];

  const companyNameMap = {
    "GRP-FINISHED": "Finished Goods",
    "GRP-TRADING": "Trading Goods",
    "GRP-RAW": "Raw Materials",
    "GRP-CONSUMABLES": "Consumables",
    "GRP-GENERAL": "General Goods",
    "COMP-STANDARD": "Standard Supply",
    "COMP-GENERAL": "General Trade",
    "COMP-NESTLE": "Standard Supply",
    "COMP-PATANJALI": "General Trade",
    "COMP-GSK": "Industrial Goods"
  };
  const targetCompanyId = updateData.companyId ? updateData.companyId.trim() : current.companyId;
  const companyName = updateData.companyName || companyNameMap[targetCompanyId] || current.companyName || "General Goods";

  const updated = {
    ...current,
    ...updateData,
    sku: updateData.sku ? updateData.sku.trim().toUpperCase() : current.sku,
    productName: updateData.productName ? updateData.productName.trim() : current.productName,
    companyId: targetCompanyId,
    companyName: companyName,
    category: updateData.category ? updateData.category.trim() : current.category,
    subcategory: updateData.subcategory !== undefined ? updateData.subcategory.trim() : current.subcategory,
    unit: updateData.unit || current.unit,
    packSize: updateData.packSize !== undefined ? updateData.packSize.trim() : current.packSize,
    mrp: updateData.mrp !== undefined ? parseFloat(updateData.mrp) : current.mrp,
    purchaseRate: updateData.purchaseRate !== undefined ? parseFloat(updateData.purchaseRate) : current.purchaseRate,
    saleRate: updateData.saleRate !== undefined ? parseFloat(updateData.saleRate) : current.saleRate,
    taxRate: updateData.taxRate !== undefined ? parseFloat(updateData.taxRate) : current.taxRate,
    discount: updateData.discount !== undefined ? parseFloat(updateData.discount) : current.discount,
    minimumStock: updateData.minimumStock !== undefined ? parseInt(updateData.minimumStock, 10) : current.minimumStock,
    batchTracking: updateData.batchTracking !== undefined ? Boolean(updateData.batchTracking) : current.batchTracking,
    expiryTracking: updateData.expiryTracking !== undefined ? Boolean(updateData.expiryTracking) : current.expiryTracking,
    description: updateData.description !== undefined ? updateData.description.trim() : current.description,
    updatedBy: updateData.updatedBy || "system",
    updatedAt: new Date().toISOString()
  };

  initialProducts[index] = updated;
  return updated;
};

export const updateProductStatusRecord = async (id, status, updatedBy = "system") => {
  const index = initialProducts.findIndex((p) => p.id === id || p.productCode === id);
  if (index === -1) return null;

  initialProducts[index].status = status;
  initialProducts[index].updatedBy = updatedBy;
  initialProducts[index].updatedAt = new Date().toISOString();

  return initialProducts[index];
};
