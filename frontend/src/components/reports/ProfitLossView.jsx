import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Printer, DollarSign, Package, PieChart, ShieldCheck } from "lucide-react";

export default function ProfitLossView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPL = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/reports/profit-loss", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("P&L error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPL();
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
            <TrendingUp size={15} />
            <span>Financial Statement</span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: "4px 0" }}>
            Profit & Loss Account (Income Statement)
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Trading account & Gross Profit, Cost of Goods Sold (COGS), Operating expenses and Net Profit margin.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="btn-secondary" onClick={fetchPL} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Recalculate</span>
          </button>
          <button className="btn-secondary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <Printer size={14} />
            <span>Print P&L</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Net Sales Revenue</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#3b82f6", marginTop: "4px" }}>
            ₹{(data?.revenue?.netSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Cost of Goods Sold (COGS)</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-dim)", marginTop: "4px" }}>
            ₹{(data?.cogs?.costOfGoodsSold || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Gross Profit</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
            ₹{(data?.grossProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "700", marginTop: "4px" }}>
            Margin: {data?.grossMarginPercent || 0}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Net Operating Profit</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6", marginTop: "4px" }}>
            ₹{(data?.netProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: "700", marginTop: "4px" }}>
            Net Margin: {data?.netMarginPercent || 0}%
          </div>
        </div>
      </div>

      {/* Trading and Profit & Loss Table */}
      <div className="glass-card" style={{ padding: "20px", border: "1px solid var(--border-card)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-main)" }}>
          Trading & Operating Statement (FY 2026-2027)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
          {/* Revenue */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(0,0,0,0.15)", borderRadius: "6px" }}>
            <strong>Gross Sales Revenue</strong>
            <span>₹{(data?.revenue?.grossSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", color: "var(--text-muted)" }}>
            <span>Less: Trade Discounts & Rebates</span>
            <span>- ₹{(data?.revenue?.discountsGiven || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid var(--border-card)", fontWeight: "700", color: "var(--primary-400)" }}>
            <span>Net Revenue from Operations</span>
            <span>₹{(data?.revenue?.netSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* COGS */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", color: "var(--text-muted)", marginTop: "8px" }}>
            <span>Add: Opening Inventory Stock</span>
            <span>₹{(data?.cogs?.openingStock || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", color: "var(--text-muted)" }}>
            <span>Add: Inward Purchases (F9)</span>
            <span>₹{(data?.cogs?.purchases || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", color: "var(--text-muted)" }}>
            <span>Less: Closing Warehouse Inventory</span>
            <span>- ₹{(data?.cogs?.closingStock || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid var(--border-card)", fontWeight: "700" }}>
            <span>Total Cost of Goods Sold (COGS)</span>
            <span>₹{(data?.cogs?.costOfGoodsSold || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Gross Profit */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", fontWeight: "800", color: "#34d399", fontSize: "0.95rem" }}>
            <span>GROSS PROFIT (Trading Account)</span>
            <span>₹{(data?.grossProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Expenses */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", color: "var(--text-muted)", marginTop: "8px" }}>
            <span>Less: Operating Expenses (Delivery fuel, handling & warehousing)</span>
            <span>- ₹{(data?.operatingExpenses || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Net Profit */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(139, 92, 246, 0.15)", borderRadius: "8px", fontWeight: "800", color: "#a78bfa", fontSize: "1.05rem" }}>
            <span>NET PROFIT FOR THE PERIOD (Transferred to Balance Sheet)</span>
            <span>₹{(data?.netProfit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
