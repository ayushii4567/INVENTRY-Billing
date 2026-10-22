import React, { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { ExceptionSeverityBadge, ExceptionStatusBadge } from "./ExceptionStatusBadge";

export default function ExceptionList({ token, onSelectException, initialSeverityFilter = "ALL" }) {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState(initialSeverityFilter);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (moduleFilter !== "ALL") params.append("module", moduleFilter);

      const res = await fetch(`http://localhost:5005/api/exceptions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setExceptions(json.data.exceptions || []);
      }
    } catch (err) {
      console.error("Failed to fetch exceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [token, search, severityFilter, statusFilter, moduleFilter]);

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      {/* Header & Filter Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search exceptions, title, references, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px 8px 36px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "10px",
              color: "var(--text-main)",
              fontSize: "0.85rem"
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {/* Severity Buttons */}
          <div style={{ display: "flex", background: "var(--bg-input)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-card)" }}>
            {["ALL", "CRITICAL", "HIGH", "WARNING"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  background: severityFilter === sev ? "var(--badge-brand-bg)" : "transparent",
                  color: severityFilter === sev ? "var(--primary-400)" : "var(--text-muted)",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Module Select */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-main)",
              fontSize: "0.8rem"
            }}
          >
            <option value="ALL">All Modules</option>
            <option value="BILLING">Billing</option>
            <option value="PAYMENTS">Payments</option>
            <option value="ORDERS">Orders</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-main)",
              fontSize: "0.8rem"
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <button
            onClick={fetchExceptions}
            title="Refresh Exceptions"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              padding: "7px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Exceptions Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Loading exception audit records...
        </div>
      ) : exceptions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Exceptions Found</p>
          <p style={{ fontSize: "0.82rem" }}>All business rules are within safe operating thresholds for selected filters.</p>
        </div>
      ) : (
        <div className="erp-table-container">
          <table className="erp-table" style={{ minWidth: "1000px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "100px" }}>Severity</th>
                <th style={{ minWidth: "180px" }}>Issue Title & ID</th>
                <th style={{ minWidth: "110px" }}>Module</th>
                <th style={{ minWidth: "170px" }}>Party / Reference</th>
                <th style={{ minWidth: "130px", textAlign: "right" }}>Exposure</th>
                <th style={{ minWidth: "130px" }}>Detected</th>
                <th style={{ minWidth: "110px" }}>Status</th>
                <th style={{ minWidth: "90px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((exc) => (
                <tr
                  key={exc.id || exc._id}
                  style={{
                    cursor: "pointer"
                  }}
                  onClick={() => onSelectException(exc)}
                >
                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <ExceptionSeverityBadge severity={exc.severity} />
                  </td>

                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "2px", whiteSpace: "nowrap" }}>
                      {exc.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--primary-400)", fontFamily: "var(--font-mono, monospace)" }}>
                      {exc.exceptionNumber}
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "var(--bg-input)",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}
                    >
                      {exc.module}
                    </span>
                  </td>

                  <td style={{ padding: "11px 14px", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                    {exc.customerName ? (
                      <div style={{ fontWeight: "600" }}>{exc.customerName}</div>
                    ) : exc.salesmanName ? (
                      <div>{exc.salesmanName}</div>
                    ) : exc.referenceNumber ? (
                      <div>{exc.referenceNumber}</div>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: "11px 14px", fontWeight: "700", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: exc.amount > 0 ? "var(--text-main)" : "var(--text-muted)" }}>
                    {exc.amount > 0 ? `₹${exc.amount.toLocaleString("en-IN")}` : "—"}
                  </td>

                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {new Date(exc.detectedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>

                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <ExceptionStatusBadge status={exc.status} />
                  </td>

                  <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectException(exc);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: "5px 12px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>Review</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
