import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw, FileText, CheckCircle2, ArrowDownRight, ArrowUpRight, Search, Printer } from "lucide-react";

export default function DayBookView({ token }) {
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dayBookData, setDayBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  const fetchDayBook = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5005/api/reports/daybook?date=${targetDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDayBookData(json.data);
      }
    } catch (e) {
      console.error("Daybook error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayBook();
  }, [targetDate, token]);

  const entries = (dayBookData?.entries || []).filter((e) => {
    if (filterType === "ALL") return true;
    return e.voucherType === filterType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Banner */}
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
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary-400)", textTransform: "uppercase" }}>
            Tally Prime Accounting
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: "4px 0" }}>
            Day Book (Daily Transaction Register)
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Complete audit trail of all Sales, Purchases, Receipts & Payments posted on selected date.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-card)" }}>
            <Calendar size={16} color="var(--primary-400)" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
            />
          </div>

          <button className="btn-secondary" onClick={fetchDayBook} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button className="btn-secondary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <Printer size={14} />
            <span>Print Day Book</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Vouchers Posted</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
            {dayBookData?.totalVouchers || 0}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Debit Amount</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#3b82f6", marginTop: "4px" }}>
            ₹{(dayBookData?.totalDebit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Credit Amount</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
            ₹{(dayBookData?.totalCredit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: "600" }}>Day Book Balance Status</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: dayBookData?.isBalanced ? "#10b981" : "#ef4444", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={18} />
            <span>{dayBookData?.isBalanced ? "Debit = Credit (Balanced)" : "Discrepancy Detected"}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-card)", paddingBottom: "10px" }}>
        {["ALL", "SALES", "PURCHASE", "RECEIPT", "PAYMENT"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              background: filterType === t ? "var(--primary-600)" : "var(--bg-input)",
              color: filterType === t ? "#ffffff" : "var(--text-muted)"
            }}
          >
            {t === "ALL" ? "All Vouchers" : t}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="glass-card" style={{ overflow: "hidden", border: "1px solid var(--border-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border-card)", color: "var(--text-dim)" }}>
              <th style={{ padding: "12px 16px" }}>Time</th>
              <th style={{ padding: "12px 16px" }}>Type</th>
              <th style={{ padding: "12px 16px" }}>Voucher No</th>
              <th style={{ padding: "12px 16px" }}>Particulars / Party</th>
              <th style={{ padding: "12px 16px" }}>Debit A/C</th>
              <th style={{ padding: "12px 16px" }}>Credit A/C</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading Day Book records...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No accounting vouchers found for {targetDate}.
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-card)", transition: "background 0.15s" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {entry.time ? new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: entry.voucherType === "SALES" ? "rgba(79, 70, 229, 0.15)" : entry.voucherType === "PURCHASE" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: entry.voucherType === "SALES" ? "#818cf8" : entry.voucherType === "PURCHASE" ? "#34d399" : "#fbbf24"
                    }}>
                      {entry.voucherType}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: "700", color: "var(--text-main)" }}>
                    {entry.voucherNumber}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-main)" }}>
                    {entry.particulars}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                    {entry.debitAccount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                    {entry.creditAccount}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "800", color: "var(--text-main)" }}>
                    ₹{entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
