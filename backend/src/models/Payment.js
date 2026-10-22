import mongoose from "mongoose";

const billMappingSchema = new mongoose.Schema(
  {
    billId: {
      type: String,
      required: true,
      trim: true
    },
    billNumber: {
      type: String,
      required: true,
      trim: true
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: [0.01, "Allocated amount must be positive"]
    },
    allocatedAt: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: [true, "Payment number is required"],
      unique: true,
      trim: true,
      index: true
    },
    paymentDate: {
      type: String,
      required: [true, "Payment date is required"],
      default: () => new Date().toISOString(),
      index: true
    },

    // Voucher / Payment Type: CUSTOMER_RECEIPT (F6) or SUPPLIER_PAYMENT (F5)
    paymentType: {
      type: String,
      enum: ["CUSTOMER_RECEIPT", "SUPPLIER_PAYMENT"],
      default: "CUSTOMER_RECEIPT",
      index: true
    },

    // Supplier reference (for SUPPLIER_PAYMENT F5 vouchers)
    supplierId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    supplierName: {
      type: String,
      default: null,
      trim: true
    },

    // Customer reference (Optional if payment is UNMATCHED UPI)
    customerId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    customerCode: {
      type: String,
      default: null,
      trim: true
    },
    customerName: {
      type: String,
      default: null,
      trim: true
    },

    // Salesman reference (Optional for office direct UPI/Bank)
    salesmanId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    salesmanCode: {
      type: String,
      default: null,
      trim: true
    },
    salesmanName: {
      type: String,
      default: null,
      trim: true
    },

    companyId: {
      type: String,
      default: ""
    },
    companyName: {
      type: String,
      default: "Distributor ERP"
    },

    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: ["CASH", "UPI", "CHEQUE", "BANK_TRANSFER", "NEFT", "RTGS", "OTHER"],
      index: true
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than zero"]
    },

    referenceNumber: {
      type: String,
      default: "",
      trim: true
    },

    // Mode-specific fields
    payerName: {
      type: String,
      default: "",
      trim: true
    },
    upiReference: {
      type: String,
      default: "",
      trim: true,
      index: true
    },

    chequeNumber: {
      type: String,
      default: "",
      trim: true,
      index: true
    },
    chequeBank: {
      type: String,
      default: "",
      trim: true
    },
    chequeDate: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["RECORDED", "MAPPED", "PARTIALLY_MAPPED", "UNMATCHED", "CANCELLED", "CONFIRMED"],
      default: "RECORDED",
      index: true
    },

    mappedAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    unmappedAmount: {
      type: Number,
      required: true,
      default: function () {
        return this.amount;
      },
      min: 0
    },

    billMappings: {
      type: [billMappingSchema],
      default: []
    },

    notes: {
      type: String,
      default: "",
      trim: true
    },

    // Cancellation audit
    cancelReason: {
      type: String,
      default: null,
      trim: true
    },
    cancelledBy: {
      type: String,
      default: null,
      trim: true
    },
    cancelledAt: {
      type: String,
      default: null
    },

    // Metadata audit
    createdBy: {
      type: String,
      default: "System"
    },
    updatedBy: {
      type: String,
      default: "System"
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
