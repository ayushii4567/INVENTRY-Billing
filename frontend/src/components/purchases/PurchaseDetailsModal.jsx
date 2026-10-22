import React from "react";
import { X, Printer, Package, Building2, Calendar, FileText } from "lucide-react";

export default function PurchaseDetailsModal({ purchase, onClose }) {
  if (!purchase) return null;

  const handlePrint = () => {
    window.print();
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
        maxWidth: "800px",
        maxHeight: "90vh",
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
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Purchase Inward Voucher #{purchase.purchaseNumber}
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
              Supplier Invoice: <strong style={{ color: "var(--primary-400)" }}>{purchase.supplierInvoiceNumber}</strong>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "0.82rem" }}
            >
              <Printer size={16} />
              <span>Print Voucher</span>
            </button>
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
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Metadata Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "16px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-card)",
            borderRadius: "14px",
            padding: "16px"
          }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Supplier (Vendor)</div>
              <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                {purchase.supplierName}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                GSTIN: {purchase.supplierGstin || "URP"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Voucher Details</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "4px" }}>
                Date: <strong>{new Date(purchase.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "2px" }}>
                Payment Mode: <strong>{purchase.paymentMode}</strong> ({purchase.paymentStatus})
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ border: "1px solid var(--border-card)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border-card)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-dim)", fontWeight: "700" }}>#</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-dim)", fontWeight: "700" }}>Item Description</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", color: "var(--text-dim)", fontWeight: "700" }}>Quantity</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-dim)", fontWeight: "700" }}>Purchase Rate</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", color: "var(--text-dim)", fontWeight: "700" }}>GST %</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-dim)", fontWeight: "700" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(purchase.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-card)" }}>
                    <td style={{ padding: "10px 14px", color: "var(--text-dim)" }}>{idx + 1}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{it.productName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{it.productCode || it.sku}</div>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: "700", color: "#10b981" }}>
                      +{it.quantity} {it.unit || "PCS"}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      ₹{Number(it.purchaseRate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--text-muted)" }}>
                      {it.taxRate}%
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "700", color: "var(--text-main)" }}>
                      ₹{Number(it.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>Subtotal (Taxable):</span>
                <span>₹{(purchase.taxableAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>Total Tax (GST):</span>
                <span>₹{(purchase.taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.15rem",
                fontWeight: "800",
                color: "var(--text-main)",
                borderTop: "1px solid var(--border-card)",
                paddingTop: "6px"
              }}>
                <span>Grand Total:</span>
                <span style={{ color: "var(--primary-400)" }}>₹{(purchase.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#10b981" }}>
                <span>Amount Paid:</span>
                <span>₹{(purchase.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", fontWeight: "700", color: "#f59e0b" }}>
                <span>Balance Due:</span>
                <span>₹{(purchase.balanceAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
