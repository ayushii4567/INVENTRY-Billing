import React, { useState } from "react";
import { X, Tag, Percent, Gift, Layers, Calendar, CheckCircle2 } from "lucide-react";

export default function AddSchemeModal({ isOpen, onClose, onSchemeCreated, token }) {
  const [formData, setFormData] = useState({
    schemeName: "",
    schemeType: "PERCENTAGE_DISCOUNT",
    targetBrand: "Finished Goods",
    applicableCategory: "All Categories",
    minQuantity: 1,
    freeQuantity: 0,
    discountPercent: 5.0,
    minOrderValue: 5000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "2026-12-31",
    status: "ACTIVE",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.schemeName.trim()) {
      setError("Scheme name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5005/api/schemes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await response.json();
      if (response.ok && json.success) {
        onSchemeCreated(json.scheme);
        onClose();
      } else {
        setError(json.message || "Failed to create trade scheme.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.15)"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626"
              }}
            >
              <Tag size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                Create FMCG Trade Scheme
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Configure deals, carton freebies, and trade discount slabs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#64748b",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: "1rem 1.5rem 0",
              padding: "0.75rem 1rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#b91c1c",
              fontSize: "0.85rem"
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
              Scheme Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maggi 12+1 Carton Deal or Festive 5% Slab"
              value={formData.schemeName}
              onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                color: "#0f172a",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                Scheme Type
              </label>
              <select
                value={formData.schemeType}
                onChange={(e) => setFormData({ ...formData, schemeType: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              >
                <option value="PERCENTAGE_DISCOUNT">Percentage Discount (%)</option>
                <option value="QUANTITY_FREE">Quantity Free (Buy X Get Y)</option>
                <option value="SLAB_DISCOUNT">Order Slab Discount</option>
                <option value="FLAT_DISCOUNT">Flat Cash Incentive</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                Target Stock Group
              </label>
              <select
                value={formData.targetBrand}
                onChange={(e) => setFormData({ ...formData, targetBrand: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              >
                <option value="All Groups">All Groups</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Trading Goods">Trading Goods</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Consumables">Consumables</option>
                <option value="General Goods">General Goods</option>
              </select>
            </div>
          </div>

          {/* Conditional Fields based on schemeType */}
          {formData.schemeType === "QUANTITY_FREE" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Buy Quantity (Min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#0f172a",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Free Quantity Given
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.freeQuantity}
                  onChange={(e) => setFormData({ ...formData, freeQuantity: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#0f172a",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Discount Percent (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#0f172a",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                  Min Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#0f172a",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                Valid From
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "0.9rem"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
                Valid Until
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "0.9rem"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "5px" }}>
              Scheme Terms & Description
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Applicable for Sadar and Model Town retailers on cash/UPI clearance."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                color: "#0f172a",
                fontSize: "0.9rem",
                resize: "none"
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "0.5rem"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.65rem 1.25rem",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                color: "#475569",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.65rem 1.5rem",
                background: "linear-gradient(135deg, #ef4444, #ea580c)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
              }}
            >
              {loading ? "Creating..." : "Save Scheme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
