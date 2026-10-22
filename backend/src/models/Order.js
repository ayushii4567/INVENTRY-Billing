import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
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
    category: {
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
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"]
    },
    saleRate: {
      type: Number,
      required: [true, "Sale rate is required"],
      min: [0, "Sale rate cannot be negative"]
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"]
    },
    taxRate: {
      type: Number,
      default: 5,
      min: [0, "Tax rate cannot be negative"]
    },
    lineSubtotal: {
      type: Number,
      required: true,
      min: 0
    },
    lineDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxableValue: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderCustomerSnapshotSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      trim: true
    },
    customerCode: {
      type: String,
      required: true,
      trim: true
    },
    shopName: {
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
    },
    salesmanId: {
      type: String,
      default: ""
    },
    salesmanName: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSalesmanSnapshotSchema = new mongoose.Schema(
  {
    salesmanId: {
      type: String,
      required: [true, "Salesman ID is required"],
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

const orderPricingSummarySchema = new mongoose.Schema(
  {
    grossSubtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalDiscount: {
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
    totalTax: {
      type: Number,
      default: 0,
      min: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0
    },
    totalQuantity: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const orderAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString()
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      index: true
    },
    orderDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
      index: true
    },
    customer: {
      type: orderCustomerSnapshotSchema,
      required: true
    },
    salesman: {
      type: orderSalesmanSnapshotSchema,
      required: true
    },
    route: {
      routeId: { type: String, default: "", index: true },
      routeCode: { type: String, default: "" },
      routeName: { type: String, default: "" }
    },
    area: {
      areaId: { type: String, default: "", index: true },
      areaCode: { type: String, default: "" },
      areaName: { type: String, default: "" }
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items) => items && items.length > 0,
        "Order must contain at least one item."
      ]
    },
    pricingSummary: {
      type: orderPricingSummarySchema,
      required: true
    },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "CANCELLED"],
      default: "DRAFT",
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    submittedAt: {
      type: String,
      default: null
    },
    submittedBy: {
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
    cancellationReason: {
      type: String,
      default: ""
    },
    auditLog: {
      type: [orderAuditLogSchema],
      default: []
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

// Compound indexes for high-volume distributor order query patterns
orderSchema.index({ "customer.customerId": 1, orderDate: -1 });
orderSchema.index({ "salesman.salesmanId": 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ "route.routeId": 1, orderDate: -1 });
orderSchema.index({ "area.areaId": 1, orderDate: -1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
