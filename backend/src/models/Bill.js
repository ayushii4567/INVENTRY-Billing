import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      trim: true
    },
    productCode: {
      type: String,
      required: [true, "Product code is required"],
      trim: true
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    companyId: {
      type: String,
      default: ""
    },
    companyName: {
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
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0, "Rate cannot be negative"]
    },
    mrp: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxableAmount: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 5,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const billCustomerSnapshotSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      trim: true
    },
    customerCode: {
      type: String,
      required: true,
      trim: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    ownerName: {
      type: String,
      default: ""
    },
    mobile: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    areaId: {
      type: String,
      default: ""
    },
    areaName: {
      type: String,
      default: ""
    },
    routeId: {
      type: String,
      default: ""
    },
    routeName: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const billSalesmanSnapshotSchema = new mongoose.Schema(
  {
    salesmanId: {
      type: String,
      required: true,
      trim: true
    },
    salesmanCode: {
      type: String,
      required: true,
      trim: true
    },
    salesmanName: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: [true, "Bill number is required"],
      unique: true,
      trim: true,
      index: true
    },
    billDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
      index: true
    },
    orderId: {
      type: String,
      default: "DIRECT",
      index: true
    },
    orderNumber: {
      type: String,
      default: "DIRECT-SALE",
      index: true
    },
    customer: {
      type: billCustomerSnapshotSchema,
      required: true
    },
    salesman: {
      type: billSalesmanSnapshotSchema,
      default: () => ({
        salesmanId: "user-owner-01",
        salesmanCode: "OWNER-01",
        salesmanName: "Direct Counter"
      })
    },
    companyId: {
      type: String,
      default: ""
    },
    companyName: {
      type: String,
      default: "Distributor ERP"
    },
    items: {
      type: [billItemSchema],
      required: true,
      validate: [
        (items) => items && items.length > 0,
        "Bill must contain at least one line item."
      ]
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxableAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    outstandingAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    billStatus: {
      type: String,
      enum: ["DRAFT", "GENERATED", "LOCKED", "CANCELLED"],
      default: "GENERATED",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
      index: true
    },
    deliveryStatus: {
      type: String,
      enum: [
        "PENDING_DISPATCH",
        "READY_FOR_DISPATCH",
        "DISPATCHED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RETURN_PENDING"
      ],
      default: "READY_FOR_DISPATCH",
      index: true
    },
    tripId: {
      type: String,
      default: null,
      index: true
    },
    tripNumber: {
      type: String,
      default: null
    },
    deliveredAt: {
      type: String,
      default: null
    },
    deliveryRemarks: {
      type: String,
      default: ""
    },
    totalItems: {
      type: Number,
      default: 0
    },
    totalQuantity: {
      type: Number,
      default: 0
    },
    generatedAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    generatedBy: {
      type: String,
      default: "system"
    },
    lockedAt: {
      type: String,
      default: null
    },
    lockedBy: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: String,
      default: null
    },
    cancelledBy: {
      type: String,
      default: null
    },
    cancelReason: {
      type: String,
      default: ""
    },
    notes: {
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

// High-efficiency compound indexes for FMCG distributor billing lookups
billSchema.index({ "customer.customerId": 1, billDate: -1 });
billSchema.index({ "salesman.salesmanId": 1, billDate: -1 });
billSchema.index({ billStatus: 1, paymentStatus: 1 });
billSchema.index({ createdAt: -1 });

export default mongoose.model("Bill", billSchema);
