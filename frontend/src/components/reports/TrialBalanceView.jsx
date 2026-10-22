import React, { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, Printer, AlertCircle, FileText, Scale } from "lucide-react";

export default function TrialBalanceView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5005/api/reports/trial-balance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Trial balance fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
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
            <Scale size={15} />
            <span>Tally Prime Financial Engine</span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: "4px 0" }}>
            Trial Balance
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Mathematical verification of double-entry bookkeeping. All ledger accounts Debit vs Credit totals.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="btn-secondary" onClick={fetchTrialBalance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Recalculate</span>
          </button>
          <button className="btn-secondary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <Printer size={14} />
            <span>Print Trial Balance</span>
          </button>
        </div>
      </div>

      {/* Audit Balance Banner */}
      <div className="glass-card" style={{
        padding: "16px 20px",
        background: data?.isBalanced ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
        border: `1px solid ${data?.isBalanced ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {data?.isBalanced ? (
            <CheckCircle2 size={24} color="#10b981" />
          ) : (
            <AlertCircle size={24} color="#ef4444" />
          )}
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: data?.isBalanced ? "#34d399" : "#f87171" }}>
              {data?.isBalanced ? "Trial Balance is Balanced & Mathematically Verified" : "Warning: Discrepancy Found in Trial Balance"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              As on {data?.asOnDate ? new Date(data.asOnDate).toLocaleDateString() : "Today"} • Double-Entry Ledger Verification
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Debits: </span>
            <strong style={{ fontSize: "1.1rem", color: "#3b82f6" }}>₹{(data?.totalDebit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Credits: </span>
            <strong style={{ fontSize: "1.1rem", color: "#10b981" }}>₹{(data?.totalCredit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Trial Balance Statement Table */}
      <div className="glass-card" style={{ overflow: "hidden", border: "1px solid var(--border-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border-card)", color: "var(--text-dim)" }}>
              <th style={{ padding: "12px 18px", width: "100px" }}>A/C Code</th>
              <th style={{ padding: "12px 18px" }}>Particulars / Account Name</th>
              <th style={{ padding: "12px 18px" }}>Account Group</th>
              <th style={{ padding: "12px 18px", textAlign: "right", width: "160px" }}>Debit Balance (₹)</th>
              <th style={{ padding: "12px 18px", textAlign: "right", width: "160px" }}>Credit Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  Calculating balanced ledger accounts...
                </td>
              </tr>
            ) : !data?.rows || data.rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No accounting rows available.
                </td>
              </tr>
            ) : (
              data.rows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-card)" }}>
                  <td style={{ padding: "12px 18px", color: "var(--text-dim)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>
                    {row.code}
                  </td>
                  <td style={{ padding: "12px 18px", fontWeight: "700", color: "var(--text-main)" }}>
                    {row.account}
                  </td>
                  <td style={{ padding: "12px 18px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {row.group}
                  </td>
                  <td style={{ padding: "12px 18px", textAlign: "right", fontWeight: "700", color: row.debit > 0 ? "#3b82f6" : "var(--text-dim)" }}>
                    {row.debit > 0 ? `₹${row.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td style={{ padding: "12px 18px", textAlign: "right", fontWeight: "700", color: row.credit > 0 ? "#10b981" : "var(--text-dim)" }}>
                    {row.credit > 0 ? `₹${row.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "rgba(79, 70, 229, 0.1)", borderTop: "2px solid var(--primary-500)", fontWeight: "800" }}>
              <td colSpan={3} style={{ padding: "14px 18px", fontSize: "0.92rem", color: "var(--text-main)", textTransform: "uppercase" }}>
                Total (Debit vs Credit Verification)
              </td>
              <td style={{ padding: "14px 18px", textAlign: "right", color: "#60a5fa", fontSize: "1rem" }}>
                ₹{(data?.totalDebit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: "14px 18px", textAlign: "right", color: "#34d399", fontSize: "1rem" }}>
                ₹{(data?.totalCredit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
