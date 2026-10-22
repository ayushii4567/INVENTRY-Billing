import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, PackagePlus, Building2, Calculator, CheckCircle2 } from "lucide-react";

export default function CreatePurchaseModal({ token, onClose, onSuccess, initialSupplier = null }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [supplierId, setSupplierId] = useState(initialSupplier?.id || initialSupplier?._id || "");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState("CREDIT");
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      productCode: "",
      productName: "",
      sku: "",
      unit: "PCS",
      quantity: 100,
      purchaseRate: 0,
      mrp: 0,
      saleRate: 0,
      discount: 0,
      taxRate: 5
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load suppliers and products for dropdown
  useEffect(() => {
    const loadData = async () => {
      setLoadingLookups(true);
      try {
        const [supRes, prodRes] = await Promise.all([
          fetch("http://localhost:5005/api/suppliers", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5005/api/products?limit=200", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const supJson = await supRes.json();
        const prodJson = await prodRes.json();

        if (supJson.success) setSuppliers(supJson.data || []);
        if (prodJson.success) setProducts(prodJson.data || []);
      } catch (e) {
        console.error("Lookups load error:", e);
      } finally {
        setLoadingLookups(false);
      }
    };
    loadData();
  }, [token]);

  const selectedSupplierObj = suppliers.find((s) => (s.id || s._id) === supplierId) || initialSupplier;

  const handleProductChange = (index, prodId) => {
    const prod = products.find((p) => (p.id || p._id) === prodId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prod.id || prod._id,
        productCode: prod.productCode,
        productName: prod.productName,
        sku: prod.sku || "",
        unit: prod.unit || "PCS",
        purchaseRate: prod.purchaseRate || (prod.saleRate ? Math.round(prod.saleRate * 0.8) : 50),
        mrp: prod.mrp || 0,
        saleRate: prod.saleRate || 0,
        taxRate: prod.taxRate !== undefined ? prod.taxRate : 5
      };
      return copy;
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        productCode: "",
        productName: "",
        sku: "",
        unit: "PCS",
        quantity: 50,
        purchaseRate: 0,
        mrp: 0,
        saleRate: 0,
        discount: 0,
        taxRate: 5
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Financial Calculations
  const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach((it) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.purchaseRate) || 0;
    const discPct = Number(it.discount) || 0;
    const taxPct = Number(it.taxRate) || 0;

    const gross = qty * rate;
    const discAmt = round2((gross * discPct) / 100);
    const taxable = round2(gross - discAmt);
    const taxAmt = round2((taxable * taxPct) / 100);

    subtotal += taxable;
    totalDiscount += discAmt;
    totalTax += taxAmt;
  });

  const grandTotal = round2(subtotal + totalTax);
  const balanceDue = round2(Math.max(0, grandTotal - (Number(paidAmount) || 0)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      setError("Please select a Supplier / Company.");
      return;
    }
    if (!supplierInvoiceNumber.trim()) {
      setError("Please enter the Supplier's Original Invoice/Bill Number.");
      return;
    }
    const validItems = items.filter((it) => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setError("Please select at least one valid product with quantity.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        supplierId,
        supplierCode: selectedSupplierObj?.supplierCode || "",
        supplierName: selectedSupplierObj?.supplierName || "Supplier",
        supplierGstin: selectedSupplierObj?.gstin || "",
        supplierInvoiceNumber: supplierInvoiceNumber.trim(),
        purchaseDate,
        paymentMode,
        paidAmount: Number(paidAmount) || 0,
        notes,
        items: validItems
      };

      const res = await fetch("http://localhost:5005/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onSuccess && onSuccess(json.message || "Purchase Inward recorded. Stock updated.");
        onClose();
      } else {
        setError(json.message || "Failed to record purchase voucher.");
      }
    } catch (err) {
      console.error("Purchase submit error:", err);
      setError("Network error while recording purchase voucher.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "960px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "20px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              padding: "10px",
              borderRadius: "12px"
            }}>
              <PackagePlus size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                  Inward Purchase Voucher (Tally F9)
                </h2>
                <span style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "var(--primary-400)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "800"
                }}>
                  STOCK INWARD
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Record supplier bill & automatically increase warehouse inventory stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "600"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Top Bar: Supplier, Invoice No, Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Supplier (Sundry Creditor) *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="input-control"
                required
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.supplierName} ({s.supplierCode}) — Due: ₹{(s.currentBalance || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Supplier Bill / Inv No *
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-9041"
                value={supplierInvoiceNumber}
                onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                className="input-control"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Purchase Bill Date *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="input-control"
                required
              />
            </div>
          </div>

          {/* Items Section Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-card)",
            paddingBottom: "8px",
            marginTop: "6px"
          }}>
            <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-main)" }}>
              Items Received (Inward Stock)
            </div>
            <button
              type="button"
              onClick={addItemRow}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--primary-400)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={14} />
              <span>Add Item Row</span>
            </button>
          </div>

          {/* Items Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-card)" }}>
                  <th style={{ padding: "8px", textAlign: "left", color: "var(--text-dim)", width: "35%" }}>Product Item</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "var(--text-dim)", width: "12%" }}>Qty (Inward)</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "var(--text-dim)", width: "15%" }}>Rate (₹)</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "var(--text-dim)", width: "10%" }}>Disc %</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "var(--text-dim)", width: "10%" }}>GST %</th>
                  <th style={{ padding: "8px", textAlign: "right", color: "var(--text-dim)", width: "14%" }}>Total (₹)</th>
                  <th style={{ padding: "8px", textAlign: "center", width: "4%" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const qty = Number(it.quantity) || 0;
                  const rate = Number(it.purchaseRate) || 0;
                  const disc = Number(it.discount) || 0;
                  const tax = Number(it.taxRate) || 0;
                  const gross = qty * rate;
                  const taxable = gross - (gross * disc) / 100;
                  const lineTotal = taxable + (taxable * tax) / 100;

                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-card)" }}>
                      <td style={{ padding: "8px" }}>
                        <select
                          value={it.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="input-control"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          required
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.productName} ({p.sku || p.productCode})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleItemFieldChange(idx, "quantity", e.target.value)}
                          className="input-control"
                          style={{ padding: "6px 8px", textAlign: "center" }}
                          required
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.purchaseRate}
                          onChange={(e) => handleItemFieldChange(idx, "purchaseRate", e.target.value)}
                          className="input-control"
                          style={{ padding: "6px 8px", textAlign: "right" }}
                          required
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={it.discount}
                          onChange={(e) => handleItemFieldChange(idx, "discount", e.target.value)}
                          className="input-control"
                          style={{ padding: "6px 8px", textAlign: "center" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <select
                          value={it.taxRate}
                          onChange={(e) => handleItemFieldChange(idx, "taxRate", e.target.value)}
                          className="input-control"
                          style={{ padding: "6px 8px", textAlign: "center" }}
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: "700", color: "var(--text-main)" }}>
                        ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment & Financial Breakdown Box */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "20px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-card)",
            borderRadius: "14px",
            padding: "18px"
          }}>
            {/* Left: Payment Mode & Cash Outflow */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
                Payment Settlement (F5 Option)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Payment Terms
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="input-control"
                  >
                    <option value="CREDIT">Full Credit (Pay Later)</option>
                    <option value="CASH">Cash Paid Now</option>
                    <option value="BANK_TRANSFER">Bank RTGS / NEFT</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="CHEQUE">Cheque Issued</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Amount Paid Today (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="input-control"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received via Vehicle CG-04-1234, Batch No: B-99"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-control"
                />
              </div>
            </div>

            {/* Right: Bill Calculation Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <span>Taxable Amount:</span>
                <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <span>Total GST Tax:</span>
                <span>₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <span>Trade Discount:</span>
                <span>-₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.1rem",
                fontWeight: "800",
                color: "var(--text-main)",
                borderTop: "1px solid var(--border-card)",
                paddingTop: "6px"
              }}>
                <span>Grand Total:</span>
                <span style={{ color: "var(--primary-400)" }}>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "700", color: "#f59e0b" }}>
                <span>Balance Due to Supplier:</span>
                <span>₹{balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid var(--border-card)",
            paddingTop: "16px"
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ minWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? "Saving & Adding Stock..." : "Save Purchase & Inward Stock"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
