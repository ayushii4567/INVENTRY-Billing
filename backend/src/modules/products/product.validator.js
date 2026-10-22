import { findProductBySku } from "./product.repository.js";

const VALID_UNITS = ["PCS", "BOX", "CASE", "PACK", "KG", "GRAM", "LTR", "ML", "DOZEN", "NOS", "SET", "BAG", "PKT", "MTR"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

export const validateCreateProduct = async (data) => {
  const errors = [];

  // 1. Product Name
  if (!data.productName || !data.productName.trim()) {
    errors.push("Product name is required.");
  }

  // 2. SKU
  if (!data.sku || !data.sku.trim()) {
    errors.push("SKU is required.");
  } else {
    const cleanSku = data.sku.trim().toUpperCase();
    const existing = await findProductBySku(cleanSku);
    if (existing) {
      errors.push(`A product with SKU '${cleanSku}' already exists (${existing.productName} - ${existing.productCode}).`);
    }
  }

  // 3. Company
  if (!data.companyId || !data.companyId.trim()) {
    errors.push("Company ID is required.");
  }

  // 4. Category
  if (!data.category || !data.category.trim()) {
    errors.push("Category is required.");
  }

  // 5. Unit
  if (!data.unit || !VALID_UNITS.includes(data.unit.toUpperCase())) {
    errors.push(`Unit is required and must be one of: ${VALID_UNITS.join(", ")}`);
  }

  // 6. Pricing Validations
  if (data.mrp === undefined || data.mrp === null || data.mrp === "") {
    errors.push("MRP is required.");
  } else {
    const mrp = parseFloat(data.mrp);
    if (isNaN(mrp) || mrp < 0) {
      errors.push("MRP must be a valid non-negative number.");
    }
  }

  if (data.saleRate === undefined || data.saleRate === null || data.saleRate === "") {
    errors.push("Sale rate is required.");
  } else {
    const saleRate = parseFloat(data.saleRate);
    if (isNaN(saleRate) || saleRate < 0) {
      errors.push("Sale rate must be a valid non-negative number.");
    }
  }

  if (data.purchaseRate !== undefined && data.purchaseRate !== null && data.purchaseRate !== "") {
    const purchaseRate = parseFloat(data.purchaseRate);
    if (isNaN(purchaseRate) || purchaseRate < 0) {
      errors.push("Purchase rate cannot be negative.");
    }
  }

  if (data.taxRate !== undefined && data.taxRate !== null && data.taxRate !== "") {
    const taxRate = parseFloat(data.taxRate);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.push("Tax rate must be between 0% and 100%.");
    }
  }

  if (data.discount !== undefined && data.discount !== null && data.discount !== "") {
    const discount = parseFloat(data.discount);
    if (isNaN(discount) || discount < 0) {
      errors.push("Discount cannot be negative.");
    }
  }

  if (data.minimumStock !== undefined && data.minimumStock !== null && data.minimumStock !== "") {
    const minStock = parseInt(data.minimumStock, 10);
    if (isNaN(minStock) || minStock < 0) {
      errors.push("Minimum stock cannot be negative.");
    }
  }

  // 7. Status
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be either 'ACTIVE' or 'INACTIVE'.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUpdateProduct = async (id, data) => {
  const errors = [];

  if (data.productName !== undefined && !data.productName.trim()) {
    errors.push("Product name cannot be empty.");
  }

  if (data.sku !== undefined) {
    const cleanSku = data.sku.trim().toUpperCase();
    if (!cleanSku) {
      errors.push("SKU cannot be empty.");
    } else {
      const existing = await findProductBySku(cleanSku);
      if (existing && existing.id !== id && existing.productCode !== id) {
        errors.push(`Another product with SKU '${cleanSku}' already exists (${existing.productName} - ${existing.productCode}).`);
      }
    }
  }

  if (data.companyId !== undefined && !data.companyId.trim()) {
    errors.push("Company ID cannot be empty.");
  }

  if (data.category !== undefined && !data.category.trim()) {
    errors.push("Category cannot be empty.");
  }

  if (data.unit !== undefined && !VALID_UNITS.includes(data.unit.toUpperCase())) {
    errors.push(`Unit must be one of: ${VALID_UNITS.join(", ")}`);
  }

  if (data.mrp !== undefined) {
    const mrp = parseFloat(data.mrp);
    if (isNaN(mrp) || mrp < 0) {
      errors.push("MRP must be a valid non-negative number.");
    }
  }

  if (data.saleRate !== undefined) {
    const saleRate = parseFloat(data.saleRate);
    if (isNaN(saleRate) || saleRate < 0) {
      errors.push("Sale rate must be a valid non-negative number.");
    }
  }

  if (data.purchaseRate !== undefined) {
    const purchaseRate = parseFloat(data.purchaseRate);
    if (isNaN(purchaseRate) || purchaseRate < 0) {
      errors.push("Purchase rate cannot be negative.");
    }
  }

  if (data.taxRate !== undefined) {
    const taxRate = parseFloat(data.taxRate);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.push("Tax rate must be between 0% and 100%.");
    }
  }

  if (data.discount !== undefined) {
    const discount = parseFloat(data.discount);
    if (isNaN(discount) || discount < 0) {
      errors.push("Discount cannot be negative.");
    }
  }

  if (data.minimumStock !== undefined) {
    const minStock = parseInt(data.minimumStock, 10);
    if (isNaN(minStock) || minStock < 0) {
      errors.push("Minimum stock cannot be negative.");
    }
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be either 'ACTIVE' or 'INACTIVE'.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
