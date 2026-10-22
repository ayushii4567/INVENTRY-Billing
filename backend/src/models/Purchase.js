import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true
    },
    productCode: {
      type: String,
      required: true,
      trim: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      default: ""
    },
    unit: {
      type: String,
      default: "PCS"
    },
    packSize: {
      type: String,
      default: ""
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    purchaseRate: {
      type: Number,
      required: true,
      min: [0, "Purchase rate cannot be negative"]
    },
    mrp: {
      type: Number,
      default: 0
    },
    saleRate: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxableAmount: {
      type: Number,
      required: true,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 5
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: [true, "Purchase voucher number is required"],
      unique: true,
      trim: true,
      index: true
    },
    supplierInvoiceNumber: {
      type: String,
      required: [true, "Supplier invoice number is required"],
      trim: true
    },
    purchaseDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
      index: true
    },
    supplierId: {
      type: String,
      required: [true, "Supplier ID is required"],
      index: true
    },
    supplierCode: {
      type: String,
      default: ""
    },
    supplierName: {
      type: String,
      required: true,
      trim: true
    },
    supplierGstin: {
      type: String,
      default: ""
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: [
        (items) => items && items.length > 0,
        "Purchase voucher must contain at least one item."
      ]
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxableAmount: {
      type: Number,
      required: true,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    roundOff: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    balanceAmount: {
      type: Number,
      required: true,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "UNPAID",
      index: true
    },
    paymentMode: {
      type: String,
      enum: ["CASH", "BANK_TRANSFER", "CHEQUE", "CREDIT", "UPI"],
      default: "CREDIT"
    },
    notes: {
      type: String,
      default: ""
    },
    receivedBy: {
      type: String,
      default: "Store Manager"
    }
  },
  {
    timestamps: true
  }
);

const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);

export default Purchase;
