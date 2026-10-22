import React, { useState, useEffect } from "react";
import { Landmark, RefreshCw, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function BalanceSheetView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBS = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/reports/balance-sheet", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Balance sheet fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBS();
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        border: "1px solid var(--border-card)"
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary-400)", fontSize: "0.76rem", fontWeight: "700", textTransform: "uppercase" }}>
            <Landmark size={15} />
            <span>Financial Position</span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: "4px 0" }}>
            Balance Sheet
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Statement of Assets, Liabilities, Working Capital and Net Worth as on current financial date.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="btn-secondary" onClick={fetchBS} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Recalculate</span>
          </button>
          <button className="btn-secondary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <Printer size={14} />
            <span>Print Balance Sheet</span>
          </button>
        </div>
      </div>

      {/* Two-Column Split (Assets vs Liabilities) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Assets Column */}
        <div className="glass-card" style={{ padding: "20px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#60a5fa" }}>ASSETS</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Application of Funds</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <div style={{ fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.74rem" }}>
              Fixed Assets
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "rgba(0,0,0,0.15)", borderRadius: "6px" }}>
              <span>Commercial Vehicles, Computers & Fixtures</span>
              <span>₹{(data?.assets?.fixedAssets || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.74rem", marginTop: "10px" }}>
              Current Assets
            </div>
            {(data?.assets?.currentAssets || []).map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid var(--border-card)" }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>₹{(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "2px solid #3b82f6", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "800", color: "#60a5fa" }}>
            <span>TOTAL ASSETS</span>
            <span>₹{(data?.assets?.totalAssets || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Liabilities & Capital Column */}
        <div className="glass-card" style={{ padding: "20px", border: "1px solid var(--border-card)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #10b981", paddingBottom: "10px", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#34d399" }}>LIABILITIES & CAPITAL</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Source of Funds</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <div style={{ fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.74rem" }}>
              Capital Account & Reserves
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "rgba(0,0,0,0.15)", borderRadius: "6px" }}>
              <span>Owner Capital & Net Worth</span>
              <span style={{ fontWeight: "600" }}>₹{(data?.liabilities?.netWorth || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid var(--border-card)", color: "#a78bfa" }}>
              <span>Add: Profit for the Year (P&L)</span>
              <span>₹{(data?.liabilities?.netProfitForPeriod || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", fontSize: "0.74rem", marginTop: "10px" }}>
              Current Liabilities
            </div>
            {(data?.liabilities?.currentLiabilities || []).map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid var(--border-card)" }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>₹{(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "2px solid #10b981", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "800", color: "#34d399" }}>
            <span>TOTAL LIABILITIES</span>
            <span>₹{(data?.assets?.totalAssets || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
