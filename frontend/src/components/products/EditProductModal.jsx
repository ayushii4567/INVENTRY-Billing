import React, { useState } from "react";
import { X, Edit3, AlertCircle, ShieldCheck } from "lucide-react";

export default function EditProductModal({ product, token, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    productName: product.productName || "",
    sku: product.sku || "",
    companyId: product.companyId || "GRP-FINISHED",
    category: product.category || "Finished Goods",
    subcategory: product.subcategory || "",
    hsnCode: product.hsnCode || "84713010",
    unit: product.unit || "PCS",
    packSize: product.packSize || "",
    mrp: product.mrp !== undefined ? product.mrp : "",
    purchaseRate: product.purchaseRate !== undefined ? product.purchaseRate : "",
    saleRate: product.saleRate !== undefined ? product.saleRate : "",
    taxRate: product.taxRate !== undefined ? product.taxRate.toString() : "18",
    discount: product.discount !== undefined ? product.discount : "0",
    minimumStock: product.minimumStock !== undefined ? product.minimumStock : "10",
    batchTracking: Boolean(product.batchTracking),
    expiryTracking: Boolean(product.expiryTracking),
    description: product.description || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.productName.trim()) {
      setError("Stock Item Name cannot be empty.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU / Part No. cannot be empty.");
      return;
    }
    if (formData.mrp === "" || parseFloat(formData.mrp) < 0) {
      setError("MRP must be a valid non-negative number.");
      return;
    }
    if (formData.saleRate === "" || parseFloat(formData.saleRate) < 0) {
      setError("Sale Rate must be a valid non-negative number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5005/api/products/${product.id || product.productCode}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await response.json();

      if (response.ok && json.success) {
        onSuccess(`Stock Item '${json.product.productName}' updated successfully!`);
        onClose();
      } else {
        setError(json.message || "Failed to update stock item.");
      }
    } catch (err) {
      console.error("Update stock item error:", err);
      setError("Network error connecting to Product Master API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div 
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          borderRadius: "20px",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-card)",
            color: "var(--text-muted)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff"
          }}>
            <Edit3 size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>
                Edit Stock Item
              </h3>
              <span style={{
                background: "var(--badge-brand-bg)",
                color: "var(--primary-400)",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                fontWeight: "700"
              }}>
                {product.productCode}
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Update commercial rates, stock group, HSN, and inventory specifications
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem"
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Section 1: Basic Information */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              1. Basic Information
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Stock Item Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  SKU / Part No. *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    textTransform: "uppercase",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stock Group & Categorization */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              2. Stock Group & Categorization
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Stock Group *
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="GRP-FINISHED">Finished Goods</option>
                  <option value="GRP-TRADING">Trading Goods</option>
                  <option value="GRP-RAW">Raw Materials</option>
                  <option value="GRP-CONSUMABLES">Consumables</option>
                  <option value="GRP-GENERAL">General Goods</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="Finished Goods">Finished Goods</option>
                  <option value="Trading Goods">Trading Goods</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Consumables">Consumables</option>
                  <option value="General Goods">General Goods</option>
                  <option value="Assemblies">Assemblies & Modules</option>
                  <option value="Packaging Materials">Packaging Materials</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Subcategory / Class
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: HSN Code & Packaging Units */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              3. HSN Code & Unit of Measure (UoM)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  HSN / SAC Code (GST) *
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  placeholder="e.g. 84713010"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    fontFamily: "var(--font-mono)",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Unit of Measure *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="BOX">BOX (Boxes)</option>
                  <option value="NOS">NOS (Numbers)</option>
                  <option value="SET">SET (Sets)</option>
                  <option value="BAG">BAG (Bags)</option>
                  <option value="PKT">PKT (Packets)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="GRAM">GRAM (Grams)</option>
                  <option value="LTR">LTR (Litres)</option>
                  <option value="ML">ML (Millilitres)</option>
                  <option value="DOZEN">DOZEN (Dozens)</option>
                  <option value="MTR">MTR (Metres)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Pack Size Specification
                </label>
                <input
                  type="text"
                  name="packSize"
                  value={formData.packSize}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pricing & Taxes */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              4. Commercial Pricing & Tax Rates
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Purchase Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchaseRate"
                  value={formData.purchaseRate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Sale Rate (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="saleRate"
                  value={formData.saleRate}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  GST Rate (%)
                </label>
                <select
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="0">0% (Exempt / Nil)</option>
                  <option value="5">5% (Standard 5%)</option>
                  <option value="12">12% (Standard 12%)</option>
                  <option value="18">18% (Standard 18%)</option>
                  <option value="28">28% (Standard 28%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Inventory Rules & Tracking Flags */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              5. Inventory Rules & Stock Control
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                  Minimum Reorder Stock
                </label>
                <input
                  type="number"
                  min="0"
                  name="minimumStock"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                <input
                  type="checkbox"
                  id="editBatchTracking"
                  name="batchTracking"
                  checked={formData.batchTracking}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-400)", cursor: "pointer" }}
                />
                <label htmlFor="editBatchTracking" style={{ fontSize: "0.85rem", color: "var(--text-main)", cursor: "pointer", fontWeight: "600" }}>
                  Batch Tracking
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                <input
                  type="checkbox"
                  id="editExpiryTracking"
                  name="expiryTracking"
                  checked={formData.expiryTracking}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-400)", cursor: "pointer" }}
                />
                <label htmlFor="editExpiryTracking" style={{ fontSize: "0.85rem", color: "var(--text-main)", cursor: "pointer", fontWeight: "600" }}>
                  Expiry Tracking
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
              Description / Notes
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-main)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.88rem",
                outline: "none",
                resize: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-muted)",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                <span>Updating Product...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
