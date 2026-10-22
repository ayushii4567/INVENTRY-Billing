import express from "express";
import Supplier from "../../models/Supplier.js";
import {
  findSuppliers,
  findSupplierById,
  createSupplierRecord,
  updateSupplierRecord
} from "./supplier.repository.js";

const router = express.Router();



// GET /api/suppliers
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", status = "ALL" } = req.query;
    const result = await findSuppliers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      status
    });
    return res.json({ success: true, data: result.suppliers, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    console.error("GET /api/suppliers error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch suppliers" });
  }
});

// GET /api/suppliers/:id
router.get("/:id", async (req, res) => {
  try {
    const supplier = await findSupplierById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    return res.json({ success: true, data: supplier });
  } catch (err) {
    console.error("GET /api/suppliers/:id error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch supplier details" });
  }
});

// POST /api/suppliers
router.post("/", async (req, res) => {
  try {
    const { supplierName, mobile } = req.body;
    if (!supplierName || !supplierName.trim()) {
      return res.status(400).json({ success: false, message: "Supplier name is required" });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const created = await createSupplierRecord(req.body, req.user || { name: "Owner" });
    return res.status(201).json({ success: true, message: "Supplier created successfully", data: created });
  } catch (err) {
    console.error("POST /api/suppliers error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create supplier" });
  }
});

// PUT /api/suppliers/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateSupplierRecord(req.params.id, req.body, req.user || { name: "Owner" });
    if (!updated) return res.status(404).json({ success: false, message: "Supplier not found" });
    return res.json({ success: true, message: "Supplier updated successfully", data: updated });
  } catch (err) {
    console.error("PUT /api/suppliers/:id error:", err);
    return res.status(500).json({ success: false, message: "Failed to update supplier" });
  }
});

// PATCH /api/suppliers/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const updated = await updateSupplierRecord(req.params.id, { status }, req.user || { name: "Owner" });
    if (!updated) return res.status(404).json({ success: false, message: "Supplier not found" });
    return res.json({ success: true, message: `Supplier marked as ${status}`, data: updated });
  } catch (err) {
    console.error("PATCH /api/suppliers/:id/status error:", err);
    return res.status(500).json({ success: false, message: "Failed to change supplier status" });
  }
});

export default router;
