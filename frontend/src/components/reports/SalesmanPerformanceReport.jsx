// frontend/src/components/reports/SalesmanPerformanceReport.jsx
import React from "react";
import { Award, UserCheck, TrendingUp, Target, MapPin } from "lucide-react";

export default function SalesmanPerformanceReport({ data }) {
  if (!data) return null;

  const { topPerformer, salesmen = [] } = data;

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
            <Award size={20} color="#6366f1" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Salesman Performance & Route Productivity
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
            Order booking volumes, collection efficiency and monthly quota achievement
          </p>
        </div>

        <div style={{
          background: "rgba(99, 102, 241, 0.12)",
          color: "#818cf8",
          padding: "6px 14px",
          borderRadius: "10px",
          fontSize: "0.8rem",
          fontWeight: "700"
        }}>
          Field Force Leaderboard
        </div>
      </div>

      {/* Top Performer Card */}
      {topPerformer && (
        <div style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          borderRadius: "16px",
          padding: "18px 22px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)"
            }}>
              🏆
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                TOP PERFORMER OF THE MONTH
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--text-main)" }}>
                {topPerformer.name}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={13} />
                <span>{topPerformer.route}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Sales</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#10b981" }}>
                {formatCurrency(topPerformer.sales)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>Collection</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--text-main)" }}>
                {formatCurrency(topPerformer.collection)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>Quota Met</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#6366f1" }}>
                {topPerformer.targetAchieved}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Salesmen Table */}
      <div className="erp-table-container">
        <table className="erp-table" style={{ minWidth: "900px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "60px" }}>Rank</th>
              <th style={{ minWidth: "180px" }}>Salesman</th>
              <th style={{ minWidth: "150px" }}>Assigned Route</th>
              <th style={{ minWidth: "80px", textAlign: "center" }}>Outlets</th>
              <th style={{ minWidth: "80px", textAlign: "center" }}>Orders</th>
              <th style={{ minWidth: "130px", textAlign: "right" }}>Gross Sales</th>
              <th style={{ minWidth: "130px", textAlign: "right" }}>Collection</th>
              <th style={{ minWidth: "120px", textAlign: "center" }}>Target Achieved</th>
            </tr>
          </thead>
          <tbody>
            {salesmen.map((s) => (
              <tr key={s.rank}>
                <td style={{ padding: "11px 14px", fontWeight: "800", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  #{s.rank}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap", fontFamily: "var(--font-mono, monospace)" }}>{s.employeeCode}</div>
                </td>
                <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontWeight: "500", whiteSpace: "nowrap" }}>
                  {s.route}
                </td>
                <td style={{ padding: "11px 14px", color: "var(--text-main)", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap" }}>
                  {s.assignedCustomers}
                </td>
                <td style={{ padding: "11px 14px", color: "var(--text-main)", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap" }}>
                  {s.orders}
                </td>
                <td style={{ padding: "11px 14px", fontWeight: "800", color: "var(--text-main)", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(s.sales)}
                </td>
                <td style={{ padding: "11px 14px", fontWeight: "800", color: "#10b981", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(s.collection)}
                </td>
                <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                  <span style={{
                    background: s.targetAchieved >= 90 ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
                    color: s.targetAchieved >= 90 ? "#10b981" : "#818cf8",
                    padding: "3px 8px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "0.75rem"
                  }}>
                    {s.achievementRate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
