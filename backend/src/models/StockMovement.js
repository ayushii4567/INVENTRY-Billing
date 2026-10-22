import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    movementNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    inventoryId: {
      type: String,
      required: true,
      index: true
    },
    productId: {
      type: String,
      required: true,
      index: true
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
    movementType: {
      type: String,
      enum: [
        "OPENING_STOCK",
        "BILL_SALE",
        "ORDER_RESERVE",
        "ORDER_RELEASE",
        "ADJUSTMENT_IN",
        "ADJUSTMENT_OUT",
        "RETURN_IN",
        "PURCHASE_IN",
        "DEMO_SEED"
      ],
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    referenceType: {
      type: String,
      enum: ["BILL", "ORDER", "MANUAL_ADJUSTMENT", "SYSTEM_SEED", "RETURN", "PURCHASE"],
      default: "SYSTEM_SEED"
    },
    referenceId: {
      type: String,
      default: ""
    },
    reason: {
      type: String,
      default: ""
    },
    performedBy: {
      type: String,
      default: "System"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const StockMovement = mongoose.models.StockMovement || mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;
