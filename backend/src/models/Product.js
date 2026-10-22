import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: [true, "Product code is required"],
      unique: true,
      trim: true,
      index: true
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    companyId: {
      type: String,
      required: [true, "Company ID is required"],
      trim: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: ""
    },
    hsnCode: {
      type: String,
      trim: true,
      default: "8471"
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["PCS", "BOX", "CASE", "PACK", "KG", "GRAM", "LTR", "ML", "DOZEN", "NOS", "SET", "BAG", "PKT", "MTR"],
      default: "PCS"
    },
    packSize: {
      type: String,
      trim: true,
      default: ""
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"]
    },
    purchaseRate: {
      type: Number,
      default: 0,
      min: [0, "Purchase rate cannot be negative"]
    },
    saleRate: {
      type: Number,
      required: [true, "Sale rate is required"],
      min: [0, "Sale rate cannot be negative"]
    },
    taxRate: {
      type: Number,
      default: 5,
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"]
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"]
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: [0, "Minimum stock cannot be negative"]
    },
    batchTracking: {
      type: Boolean,
      default: false
    },
    expiryTracking: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    createdBy: {
      type: String,
      default: "system"
    },
    updatedBy: {
      type: String,
      default: "system"
    }
  },
  {
    timestamps: true
  }
);

// Compound & Performance Indexes
productSchema.index({ companyId: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ productName: "text", sku: "text", productCode: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
