import React, { useState } from "react";
import { X, Building2, Phone, Mail, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export default function AddSupplierModal({ token, onClose, onSuccess, initialSupplier = null }) {
  const isEditing = Boolean(initialSupplier);
  const [formData, setFormData] = useState({
    supplierName: initialSupplier?.supplierName || "",
    contactPerson: initialSupplier?.contactPerson || "",
    mobile: initialSupplier?.mobile || "",
    alternateMobile: initialSupplier?.alternateMobile || "",
    email: initialSupplier?.email || "",
    address: initialSupplier?.address || "",
    city: initialSupplier?.city || "Raipur",
    state: initialSupplier?.state || "Chhattisgarh",
    pincode: initialSupplier?.pincode || "492001",
    gstin: initialSupplier?.gstin || "",
    pan: initialSupplier?.pan || "",
    openingBalance: initialSupplier?.openingBalance || 0,
    creditDays: initialSupplier?.creditDays || 30,
    bankDetails: {
      bankName: initialSupplier?.bankDetails?.bankName || "",
      accountNumber: initialSupplier?.bankDetails?.accountNumber || "",
      ifscCode: initialSupplier?.bankDetails?.ifscCode || ""
    },
    notes: initialSupplier?.notes || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bank_")) {
      const field = name.replace("bank_", "");
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      setError("Supplier / Company Name is required.");
      return;
    }
    if (!formData.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `http://localhost:5005/api/suppliers/${initialSupplier.id || initialSupplier._id}`
        : "http://localhost:5005/api/suppliers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onSuccess && onSuccess(isEditing ? "Supplier updated successfully" : "New Supplier added successfully");
        onClose();
      } else {
        setError(json.message || "Failed to save supplier.");
      }
    } catch (err) {
      console.error("Supplier save error:", err);
      setError("Network error while connecting to server.");
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
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "680px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "20px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary-400)",
              padding: "10px",
              borderRadius: "12px"
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                {isEditing ? "Edit Supplier (Sundry Creditor)" : "Add New Supplier (Sundry Creditor)"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Company / FMCG Manufacturer account for Inward Purchase bills
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

        {/* Modal Body */}
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

          {/* Supplier Name & Contact Person */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Supplier Company Name *
              </label>
              <input
                type="text"
                name="supplierName"
                placeholder="e.g. Nestlé India Limited"
                value={formData.supplierName}
                onChange={handleChange}
                className="input-control"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Contact Person / Manager
              </label>
              <input
                type="text"
                name="contactPerson"
                placeholder="e.g. Alok Sengupta"
                value={formData.contactPerson}
                onChange={handleChange}
                className="input-control"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="e.g. 9826112233"
                value={formData.mobile}
                onChange={handleChange}
                className="input-control"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. depot@nestle.com"
                value={formData.email}
                onChange={handleChange}
                className="input-control"
              />
            </div>
          </div>

          {/* Address & City */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
              Warehouse / Factory Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="e.g. Plot 14-16, Urla Industrial Complex"
              value={formData.address}
              onChange={handleChange}
              className="input-control"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="input-control"
              />
            </div>
          </div>

          {/* GSTIN, PAN & Terms */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                GSTIN Number
              </label>
              <input
                type="text"
                name="gstin"
                placeholder="22AAACN0142D1Z8"
                value={formData.gstin}
                onChange={handleChange}
                className="input-control"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Credit Days (Terms)
              </label>
              <input
                type="number"
                name="creditDays"
                placeholder="30"
                value={formData.creditDays}
                onChange={handleChange}
                className="input-control"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>
                Opening Balance (₹)
              </label>
              <input
                type="number"
                name="openingBalance"
                placeholder="0"
                value={formData.openingBalance}
                onChange={handleChange}
                className="input-control"
              />
            </div>
          </div>

          {/* Bank Details */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-card)",
            borderRadius: "12px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "10px" }}>
              Bank Account for Payments
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "10px" }}>
              <input
                type="text"
                name="bank_bankName"
                placeholder="Bank Name (e.g. HDFC)"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                className="input-control"
              />
              <input
                type="text"
                name="bank_accountNumber"
                placeholder="Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                className="input-control"
              />
              <input
                type="text"
                name="bank_ifscCode"
                placeholder="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
                className="input-control"
                style={{ textTransform: "uppercase" }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "10px",
            borderTop: "1px solid var(--border-card)",
            paddingTop: "16px"
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ minWidth: "140px" }}
            >
              {loading ? "Saving..." : isEditing ? "Update Supplier" : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
