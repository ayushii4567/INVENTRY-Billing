// frontend/src/components/reports/OutstandingReport.jsx
import React from "react";
import { Clock, ShieldAlert, AlertTriangle, Store, User, Phone } from "lucide-react";

export default function OutstandingReport({ data }) {
  if (!data) return null;

  const { totalOutstanding = 0, ageingBuckets = [], criticalCustomers = [] } = data;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="glass-card" style={{ padding: "24px", borderRadius: "18px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Clock size={20} color="#ef4444" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Outstanding Receivables & Ageing Spectrum
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
            Categorized by credit delay and overdue severity
          </p>
        </div>

        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          color: "#ef4444",
          padding: "6px 14px",
          borderRadius: "10px",
          fontSize: "0.8rem",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <ShieldAlert size={16} />
          <span>Total: {formatCurrency(totalOutstanding)}</span>
        </div>
      </div>

      {/* Ageing Spectrum Grid */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "10px" }}>
          Ageing Distribution Buckets
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {ageingBuckets.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-input)",
                border: `1px solid ${b.color}40`,
                borderTop: `4px solid ${b.color}`,
                borderRadius: "12px",
                padding: "12px"
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
                {b.range}
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "900", color: b.color, marginBottom: "2px" }}>
                {formatCurrency(b.amount)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>{b.percentage}%</span>
                <span style={{ fontWeight: "600" }}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Overdue Customers Table */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <AlertTriangle size={18} color="#ef4444" />
          <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-main)" }}>
            Top 5 Critical Overdue Retailers (Credit Policy Breached)
          </span>
        </div>

        <div className="erp-table-container">
          <table className="erp-table" style={{ minWidth: "850px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "60px" }}>Rank</th>
                <th style={{ minWidth: "200px" }}>Retailer Name</th>
                <th style={{ minWidth: "160px" }}>Route / Salesman</th>
                <th style={{ minWidth: "130px", textAlign: "right" }}>Outstanding</th>
                <th style={{ minWidth: "120px" }}>Overdue Days</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>Credit Limit</th>
                <th style={{ minWidth: "130px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {criticalCustomers.map((c) => (
                <tr key={c.rank}>
                  <td style={{ padding: "11px 14px", fontWeight: "800", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    #{c.rank}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{c.code} • {c.phone}</div>
                  </td>
                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ color: "var(--text-main)", fontWeight: "600" }}>{c.route}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Salesman: {c.salesman}</div>
                  </td>
                  <td style={{ padding: "11px 14px", fontWeight: "800", color: "#ef4444", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(c.outstanding)}
                  </td>
                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#ef4444",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "0.75rem"
                    }}>
                      {c.overdueDays} Days
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontWeight: "600", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(c.creditLimit)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <span style={{
                      background: c.status === "SEVERE_OVERDUE" ? "rgba(185, 28, 28, 0.2)" : "rgba(239, 68, 68, 0.12)",
                      color: c.status === "SEVERE_OVERDUE" ? "#b91c1c" : "#ef4444",
                      padding: "3px 8px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "0.72rem"
                    }}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
