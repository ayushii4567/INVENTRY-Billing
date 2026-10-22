import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      required: [true, "Supplier code is required"],
      unique: true,
      trim: true,
      index: true
    },
    supplierName: {
      type: String,
      required: [true, "Supplier company name is required"],
      trim: true,
      index: true
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ""
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true
    },
    alternateMobile: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      default: "Raipur"
    },
    state: {
      type: String,
      trim: true,
      default: "Chhattisgarh"
    },
    pincode: {
      type: String,
      trim: true,
      default: ""
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
    },
    openingBalance: {
      type: Number,
      default: 0
    },
    currentBalance: {
      type: Number,
      default: 0
    },
    creditDays: {
      type: Number,
      default: 30
    },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branch: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

supplierSchema.index({ supplierName: "text", supplierCode: "text", mobile: "text", gstin: "text" });

const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default Supplier;
