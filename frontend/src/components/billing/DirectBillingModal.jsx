import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, CheckCircle2, AlertCircle, ShoppingBag, Store, Calculator, Printer } from "lucide-react";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

export default function DirectBillingModal({ token, user, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    customerId: "",
    customerName: "",
    mobile: "",
    address: ""
  });
  const [paymentMode, setPaymentMode] = useState("CREDIT");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    {
      productId: "",
      productName: "",
      productCode: "",
      sku: "",
      unit: "PCS",
      quantity: 1,
      rate: 0,
      mrp: 0,
      discount: 0,
      taxRate: 18
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load Customers & Products
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch("http://localhost:5005/api/customers?limit=100", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5005/api/products?limit=100", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const [cJson, pJson] = await Promise.all([cRes.json(), pRes.json()]);
        if (cJson.success && cJson.data) setCustomers(cJson.data);
        if (pJson.success && pJson.data) setProducts(pJson.data);
      } catch (e) {
        console.error("Load masters error:", e);
      }
    };
    loadMasters();
  }, [token]);

  // Handle Customer Selection
  const handleCustomerChange = (cId) => {
    setSelectedCustomerId(cId);
    const found = customers.find((c) => c.id === cId || c.customerCode === cId);
    if (found) {
      setCustomerInfo({
        customerId: found.id || found.customerCode,
        customerCode: found.customerCode,
        customerName: found.shopName || found.ownerName,
        ownerName: found.ownerName || "",
        mobile: found.mobile || "",
        address: found.address || ""
      });
    }
  };

  // Add Item Line
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        productCode: "",
        sku: "",
        unit: "PCS",
        quantity: 1,
        rate: 0,
        mrp: 0,
        discount: 0,
        taxRate: 18
      }
    ]);
  };

  // Remove Item Line
  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Item Select
  const handleItemProductSelect = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId || p.productCode === prodId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prod.id,
        productCode: prod.productCode,
        sku: prod.sku || "",
        productName: prod.productName,
        unit: prod.unit || "PCS",
        rate: prod.saleRate || prod.purchaseRate || 0,
        mrp: prod.mrp || 0,
        taxRate: prod.taxRate !== undefined ? prod.taxRate : 18
      };
      return copy;
    });
  };

  // Handle Line Value Change
  const handleLineChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Financial Calculations
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const calculatedItems = items.map((i) => {
    const qty = Number(i.quantity) || 1;
    const rate = Number(i.rate) || 0;
    const gross = qty * rate;
    const discPct = Number(i.discount) || 0;
    const discAmt = round2((gross * discPct) / 100);
    const taxable = round2(gross - discAmt);
    const taxRate = Number(i.taxRate) || 0;
    const taxAmt = round2((taxable * taxRate) / 100);
    const total = round2(taxable + taxAmt);

    subtotal = round2(subtotal + taxable);
    totalDiscount = round2(totalDiscount + discAmt);
    totalTax = round2(totalTax + taxAmt);

    return { ...i, taxable, taxAmt, total };
  });

  const grandTotal = round2(subtotal + totalTax);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerInfo.customerName) {
      setError("Please select or enter customer details.");
      return;
    }
    const validItems = items.filter((i) => i.productName && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError("Please add at least one product with valid quantity.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        customer: customerInfo,
        items: validItems,
        paymentMode,
        paidAmount: paymentMode === "CASH" ? grandTotal : 0,
        notes
      };

      const res = await fetch("http://localhost:5005/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onSuccess(json.data, json.message);
        onClose();
      } else {
        setError(json.message || "Failed to create sales invoice.");
      }
    } catch (err) {
      setError("Network error connecting to billing engine.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 1200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "900px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)"
        }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase" }}>Tally F8 Sales Voucher</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>Create Direct Sales Invoice</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Selection Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                Select Customer (Sundry Debtor)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.86rem" }}
              >
                <option value="">-- Choose Existing Retail Store --</option>
                {customers.map((c) => (
                  <option key={c.id || c.customerCode} value={c.id || c.customerCode}>
                    {c.shopName || c.ownerName} ({c.customerCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                Customer Name / Firm
              </label>
              <input
                type="text"
                required
                placeholder="Shop or Customer Name"
                value={customerInfo.customerName}
                onChange={(e) => setCustomerInfo((p) => ({ ...p, customerName: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.86rem" }}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)" }}>Items & Billable Stock</span>
              <button
                type="button"
                onClick={handleAddItem}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: "700", color: "var(--primary-400)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <Plus size={15} /> Add Line Item
              </button>
            </div>

            <div style={{ border: "1px solid var(--border-card)", borderRadius: "8px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border-card)", color: "var(--text-dim)" }}>
                    <th style={{ padding: "8px 12px", width: "40%" }}>Product SKU</th>
                    <th style={{ padding: "8px 12px", width: "12%" }}>Qty</th>
                    <th style={{ padding: "8px 12px", width: "16%" }}>Rate (₹)</th>
                    <th style={{ padding: "8px 12px", width: "12%" }}>Disc %</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Total (₹)</th>
                    <th style={{ padding: "8px 8px", width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-card)" }}>
                      <td style={{ padding: "8px 12px" }}>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemProductSelect(idx, e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.82rem" }}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.productName} ({p.sku || p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineChange(idx, "quantity", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.82rem" }}
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleLineChange(idx, "rate", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.82rem" }}
                        />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleLineChange(idx, "discount", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.82rem" }}
                        />
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700" }}>
                        ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          style={{ background: "transparent", border: "none", color: "#f87171", cursor: items.length > 1 ? "pointer" : "not-allowed" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Controls & Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginTop: "4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Payment Terms / Mode
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["CREDIT", "CASH", "UPI"].map((m) => (
                    <label key={m} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.82rem" }}>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === m}
                        onChange={() => setPaymentMode(m)}
                      />
                      <span>{m === "CREDIT" ? "Credit (A/C)" : m === "CASH" ? "Cash (Counter)" : "Instant UPI"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Narration / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter sale, festival discount applied"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "var(--bg-input)", border: "1px solid var(--border-card)", color: "var(--text-main)", fontSize: "0.82rem" }}
                />
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.2)", padding: "14px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.84rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Taxable Subtotal:</span>
                <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399" }}>
                <span>Total Tax (GST):</span>
                <span>+ ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "800", color: "var(--primary-400)", borderTop: "1px solid var(--border-card)", paddingTop: "8px", marginTop: "4px" }}>
                <span>Invoice Total:</span>
                <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Posting F8 Invoice..." : `Generate & Post Invoice (₹${grandTotal.toLocaleString("en-IN")})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
